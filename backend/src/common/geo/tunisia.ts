export const TUNISIA_BOUNDS = {
  minLat: 30,
  maxLat: 38,
  minLng: 7,
  maxLng: 12,
} as const;

export const roundCoordinate = (value: number, decimals = 6): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const tileToLng = (x: number, z: number): number => (x / 2 ** z) * 360 - 180;

const tileToLat = (y: number, z: number): number => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};

export const tileIntersectsTunisia = (z: number, x: number, y: number): boolean => {
  const west = tileToLng(x, z);
  const east = tileToLng(x + 1, z);
  const north = tileToLat(y, z);
  const south = tileToLat(y + 1, z);

  return (
    east >= TUNISIA_BOUNDS.minLng &&
    west <= TUNISIA_BOUNDS.maxLng &&
    north >= TUNISIA_BOUNDS.minLat &&
    south <= TUNISIA_BOUNDS.maxLat
  );
};
