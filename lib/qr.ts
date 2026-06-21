// lib/qr.ts
// Pure-JS QR matrix generation for Live Conversation pairing. Uses the QR encoder
// vendored inside qrcode-terminal (pinned in package.json) — it ships no native
// code, so there is nothing to rebuild and no need for react-native-svg. We only
// take the boolean module matrix; QRCodeView renders it with plain <View>s.
// @ts-expect-error - vendored pure-JS encoder ships no type declarations
import QRCodeEncoder from 'qrcode-terminal/vendor/QRCode';
// @ts-expect-error - vendored pure-JS encoder ships no type declarations
import QRErrorCorrectLevel from 'qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel';

// Encode `text` into a square matrix of modules (true = dark). Auto-sizes the QR
// version to the input; pairing payloads are tiny so this stays a small code.
export const qrMatrix = (text: string): boolean[][] => {
  const qr = new QRCodeEncoder(-1, QRErrorCorrectLevel.M); // -1 = auto version
  qr.addData(text);
  qr.make();
  const count: number = qr.getModuleCount();
  const rows: boolean[][] = [];
  for (let r = 0; r < count; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < count; c++) row.push(Boolean(qr.isDark(r, c)));
    rows.push(row);
  }
  return rows;
};
