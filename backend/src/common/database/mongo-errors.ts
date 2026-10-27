export const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
