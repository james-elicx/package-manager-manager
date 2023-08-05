export const lockFiles = {
	npm: 'package-lock.json',
	yarn: 'yarn.lock',
	pnpm: 'pnpm-lock.yaml',
	bun: 'bun.lockb',
} as const;

const lockFileNames = Object.values(lockFiles);

/**
 * Checks if the given filename is a lock file (for any package manager)
 *
 * @param filename the filename to check
 * @returns true if the given filename is that of a lock file, false otherwise
 */
export function isLockFile(filename: string): boolean {
	return lockFileNames.includes(filename as (typeof lockFileNames)[number]);
}
