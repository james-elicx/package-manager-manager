

export const lockFiles = {
  'npm': 'package-lock.json',
  'yarn': 'yarn.lock',
  'pnpm': 'pnpm-lock.yaml',
  'bun': 'bun.lockb',
} as const;

const lockFileNames = Object.values(lockFiles);

export function isLockFile(filename: string): boolean {
  return lockFileNames.includes(filename as typeof lockFileNames[number]);
}