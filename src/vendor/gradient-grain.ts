// Adapted from gradients.sh (https://gradients.sh/). See THIRD_PARTY_NOTICES.md.
export function grainLayer(amount: number): string {
  const opacity = (0.06 + amount * 0.16).toFixed(3);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 ${opacity}'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0 / 180px 180px repeat`;
}
