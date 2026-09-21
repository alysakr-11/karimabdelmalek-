/**
 * Reads intrinsic pixel dimensions straight from image file headers.
 *
 * Dependency-free on purpose: the manifest needs true width/height so the
 * gallery can reserve the right box before an image loads, and that should not
 * require a native image library in the toolchain.
 *
 * Supports PNG, JPEG, WebP and GIF — the formats a photographer or gallery
 * actually hands over.
 */
import fs from 'node:fs';

export function imageSize(file) {
  const buf = fs.readFileSync(file);

  // PNG: an IHDR chunk always starts at byte 8, dimensions at 16/20.
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // GIF: logical screen descriptor, little-endian, at byte 6.
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // WebP: three sub-formats under one RIFF container.
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (kind === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (kind === 'VP8X') {
      const rd24 = (o) => buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16);
      return { width: rd24(24) + 1, height: rd24(27) + 1 };
    }
  }

  // JPEG: walk the marker segments to the first start-of-frame.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0-SOF15, excluding the DHT/JPG/DAC markers that share the range.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }

  throw new Error(`Unrecognised image format: ${file}`);
}
