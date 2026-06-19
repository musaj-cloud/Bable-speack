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
const CMD_CONNECT = 1 // RN -> worklet: join the topic for a pairing code
const CMD_SEND = 2 // RN -> worklet: broadcast a JSON message to peers
const CMD_DISCONNECT = 3 // RN -> worklet: leave the swarm
const CMD_STATUS = 10 // worklet -> RN: connection state changed
const CMD_MESSAGE = 11 // worklet -> RN: a message arrived from a peer

let swarm = null
const peers = new Set()

const rpc = new RPC(BareKit.IPC, (req) => {
  const data = req.data ? b4a.toString(req.data) : ''
  if (req.command === CMD_CONNECT) join(data)
  else if (req.command === CMD_SEND) broadcast(data)
  else if (req.command === CMD_DISCONNECT) leave()
})

// Push a connection-state update to the RN side (fire-and-forget event).
const status = (state, extra) =>
  rpc.event(CMD_STATUS).send(JSON.stringify({ state, peers: peers.size, ...extra }), 'utf8')

// Hash the human pairing code into a stable 32-byte swarm topic. Both phones
// type the same code -> same topic -> they discover each other on the DHT.
const topicFor = (code) =>
  crypto.hash(b4a.from(`babelspeak/p2p/v1/${code.trim().toLowerCase()}`))

async function join(code) {
  await leave()
  if (!code.trim()) return status('error', { message: 'Empty pairing code' })
  try {
    swarm = new Hyperswarm()
    swarm.on('connection', onConnection)
    status('searching')
    const discovery = swarm.join(topicFor(code), { server: true, client: true })
    await discovery.flushed()
  } catch (err) {
    status('error', { message: err && err.message ? err.message : String(err) })
  }
}

// Wire framing: newline-delimited JSON. Messages are short text, so a simple
// line protocol over the (already noise-encrypted) Hyperswarm stream is enough.
function onConnection(conn) {
  peers.add(conn)
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
  conn.on('error', () => {}) // a dropped peer is normal; close handles cleanup
  conn.on('close', () => {
    peers.delete(conn)
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
