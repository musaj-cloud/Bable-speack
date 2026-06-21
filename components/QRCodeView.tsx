import { useMemo } from 'react';
import { View } from 'react-native';
import { qrMatrix } from '@/lib/qr';

type Props = {
  value: string;
  size?: number; // pixel size of the code, excluding the white quiet-zone margin
};

// A QR code must be pure black-on-white to scan reliably, so these are fixed
// (not theme tokens) — same reasoning as camera/media surfaces. The code always
// sits on its own white card (see LiveHostCard).
const DARK = '#000000';
const LIGHT = '#ffffff';
const QUIET = 4; // modules of white margin the QR spec requires around the code

// Renders a QR matrix as plain Views — no react-native-svg, nothing native. Each
// row is drawn as merged horizontal runs of dark modules to keep the view count
// low (one View per run instead of one per module).
export const QRCodeView = ({ value, size = 220 }: Props) => {
  const matrix = useMemo(() => qrMatrix(value), [value]);
  const count = matrix.length + QUIET * 2;
  const cell = size / count;

  const runs = matrix.flatMap((row, r) => {
    const out: { key: string; top: number; left: number; width: number }[] = [];
    let c = 0;
    while (c < row.length) {
      if (!row[c]) {
        c++;
        continue;
      }
      let len = 1;
      while (c + len < row.length && row[c + len]) len++;
      out.push({
        key: `${r}-${c}`,
        top: (r + QUIET) * cell,
        left: (c + QUIET) * cell,
        width: len * cell,
      });
      c += len;
    }
    return out;
  });

  return (
    <View style={{ width: size, height: size, backgroundColor: LIGHT }}>
      {runs.map((run) => (
        <View
          key={run.key}
          style={{
            position: 'absolute',
            top: run.top,
            left: run.left,
            width: run.width,
            height: cell,
            backgroundColor: DARK,
          }}
        />
      ))}
    </View>
  );
};
