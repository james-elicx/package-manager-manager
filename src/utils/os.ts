/**
 * Checks whether the current platform is Windows.
 *
 * @returns Whether the current platform is Windows.
 */
export const isWindows = (): boolean => process.platform === 'win32';
