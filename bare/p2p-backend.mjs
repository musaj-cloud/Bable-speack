/* global BareKit */
// bare/p2p-backend.mjs
// BabelSpeak Phase 7 — P2P live-conversation backend.
//
// This runs inside a Bare worklet (react-native-bare-kit), NOT React Native's
// Hermes engine, because Hyperswarm + its DHT/crypto stack are Bare modules.
// It joins a Hyperswarm DHT topic derived from a short pairing code and relays
// small JSON text messages between the two paired phones.
//
// PRIVACY: each phone translates locally — only { id, text, sourceLang, ts }
// ever crosses the wire, never audio. The DHT carries text between two
// consenting paired devices and nothing else (no relay stores it).
//
// Bridged to the RN side (lib/p2p.ts) over bare-rpc on BareKit.IPC. Pack it
// into a worklet bundle with `npm run build:p2p` (see bare/README.md).
import RPC from 'bare-rpc'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import b4a from 'b4a'

// RPC command ids — MUST stay in sync with lib/p2p.ts.
const CMD_CONNECT = 1 // RN -> worklet: join a session (JSON { code })
const CMD_SEND = 2 // RN -> worklet: broadcast a JSON message to peers
const CMD_DISCONNECT = 3 // RN -> worklet: leave the swarm
const CMD_HOST = 4 // RN -> worklet: host a session for a code
const CMD_STATUS = 10 // worklet -> RN: connection state changed
const CMD_MESSAGE = 11 // worklet -> RN: a message arrived from a peer
const CMD_PAIRINFO = 12 // worklet -> RN: host pairing info { code } for the QR
const CMD_LOG = 13 // worklet -> RN: diagnostic line (surfaced in the Metro console)

let swarm = null
const peers = new Set()

const rpc = new RPC(BareKit.IPC, (req) => {
  const data = req.data ? b4a.toString(req.data) : ''
  if (req.command === CMD_CONNECT) join(data)
  else if (req.command === CMD_HOST) host(data)
  else if (req.command === CMD_SEND) broadcast(data)
  else if (req.command === CMD_DISCONNECT) leave()
})

// Push a connection-state update to the RN side (fire-and-forget event).
const status = (state, extra) =>
  rpc.event(CMD_STATUS).send(JSON.stringify({ state, peers: peers.size, ...extra }), 'utf8')

// Diagnostic line surfaced in the Metro console (see lib/p2p.ts CMD_LOG handler).
const log = (msg) => {
  try {
    rpc.event(CMD_LOG).send(String(msg), 'utf8')
  } catch {
    // RPC not ready — drop the log line
  }
}

// Hash the human pairing code into a stable 32-byte swarm topic. Both phones
// use the same code -> same topic -> they discover each other on the DHT.
const topicFor = (code) =>
  crypto.hash(b4a.from(`babelspeak/p2p/v1/${code.trim().toLowerCase()}`))

// HOST: announce the pairing topic on the Holepunch DHT and hand the code back to
// the UI for the QR. Hyperswarm does discovery + NAT hole-punching over the DHT,
// so both phones only need to reach the internet (Wi-Fi or mobile data).
async function host(code) {
  await leave()
  const trimmed = (code || '').trim()
  if (!trimmed) return status('error', { message: 'Empty pairing code' })
  try {
    swarm = new Hyperswarm()
    swarm.on('connection', onConnection)
    // Hand the code to the UI for the QR before announcing the topic.
    rpc.event(CMD_PAIRINFO).send(JSON.stringify({ code: trimmed }), 'utf8')
    status('searching')
    // Host is server-ONLY: it announces the topic and accepts the joiner's
    // connection. Pairing one server with one client (see join) gives exactly one
    // connection that fires 'connection' on both ends — server+client on both
    // sides can mis-pair (or self-connect) so that the joiner shows "connected"
    // while the host's accept side never fires.
    const discovery = swarm.join(topicFor(trimmed), { server: true, client: false })
    await discovery.flushed()
    log('host: announced topic on the DHT, waiting for a joiner')
  } catch (err) {
    log(`host: error ${err && err.message ? err.message : String(err)}`)
    status('error', { message: err && err.message ? err.message : String(err) })
  }
}

// JOIN: payload is JSON { code } (or a raw code string). Look up the host's
// announced topic on the Holepunch DHT and connect; Hyperswarm handles discovery
// and NAT hole-punching over the internet.
async function join(payload) {
  await leave()
  let code = ''
  try {
    const p = JSON.parse(payload)
    code = (p.code || '').trim()
  } catch {
    code = (payload || '').trim() // backwards-compatible raw-code path
  }
  if (!code) return status('error', { message: 'Empty pairing code' })
  try {
    swarm = new Hyperswarm()
    swarm.on('connection', onConnection)
    status('searching')
    // Joiner is client-ONLY: it looks up the host's announced topic and initiates
    // the single connection (host is server-only — see host()).
    log('joiner: looking up topic on the DHT')
    const discovery = swarm.join(topicFor(code), { server: false, client: true })
    await discovery.flushed()
    log('joiner: lookup flushed, awaiting connection')
  } catch (err) {
    log(`joiner: error ${err && err.message ? err.message : String(err)}`)
    status('error', { message: err && err.message ? err.message : String(err) })
  }
}

// Wire framing: newline-delimited JSON. Messages are short text, so a simple
// line protocol over the (already noise-encrypted) Hyperswarm stream is enough.
function onConnection(conn) {
  peers.add(conn)
  log(`connection event fired — peers=${peers.size}`)
  status('connected')
  let buf = ''
  conn.on('data', (chunk) => {
    buf += b4a.toString(chunk)
    let nl
    while ((nl = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, nl)
      buf = buf.slice(nl + 1)
      if (line) rpc.event(CMD_MESSAGE).send(line, 'utf8')
    }
  })
  conn.on('error', (err) => log(`connection error: ${err && err.message ? err.message : err}`))
  conn.on('close', () => {
    peers.delete(conn)
    log(`connection closed — peers=${peers.size}`)
    status(peers.size ? 'connected' : 'searching')
  })
}

function broadcast(json) {
  if (!json) return
  const frame = b4a.from(`${json}\n`)
  for (const conn of peers) {
    try {
      conn.write(frame)
    } catch {
      // peer went away mid-write; its 'close' will clean it up
    }
  }
}

async function leave() {
  for (const conn of peers) {
    try {
      conn.destroy()
    } catch {
      // already destroyed
    }
  }
  peers.clear()
  if (swarm) {
    const s = swarm
    swarm = null
    try {
      await s.destroy()
    } catch {
      // never fully started
    }
  }
  status('idle')
}
