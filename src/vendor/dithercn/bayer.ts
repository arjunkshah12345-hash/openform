// Adapted from dithercn (https://dithercn.dev/). See THIRD_PARTY_NOTICES.md.
export interface ThresholdMap {
  /** Width and height in cells. The map tiles in both directions. */
  readonly size: number;
  /** Row-major thresholds in (0, 1). */
  readonly thresholds: Float32Array;
  /** Row-major ranks, 0 to `size * size - 1` (0 to 255 for blue noise). */
  readonly ranks: Uint8Array;
  /** Distinct thresholds, so `levels` tones fill it from paper to ink. */
  readonly steps: number;
}

const fromRanks = (size: number, ranks: Uint8Array, steps: number) => ({
  ranks,
  size,
  steps,
  thresholds: Float32Array.from(ranks, (rank) => (rank + 0.5) / steps),
});

// Bayer ranks: interleave the bits of (x xor y) and y, least significant
// first, so each 2x2 block of the previous size splits into four.
const bayerRanks = (size: number): Uint8Array => {
  const ranks = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let rank = 0;
      for (let bit = 1; bit < size; bit *= 2) {
        const xBit = Math.floor(x / bit) % 2;
        const yBit = Math.floor(y / bit) % 2;
        rank = rank * 4 + 2 * ((xBit + yBit) % 2) + yBit;
      }
      ranks[y * size + x] = rank;
    }
  }
  return ranks;
};

export const BAYER_8: ThresholdMap = fromRanks(8, bayerRanks(8), 64);
