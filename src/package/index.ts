import type { PackageManager } from '../packageManager';

import { getBunGetPackageInfoFunction } from './bun';
import { getNpmOrPnpmGetPackageInfoFunction } from './npmAndPnpm';
import { getYarnGetPackageInfoFunction } from './yarn';

type PackageInfo = {
	/** The name of the package */
	name: string;
	/** The version of the package */
	version: string;
};

export type GetPackageInfo = (packageName: string) => Promise<PackageInfo | null>;

/**
 * Given a package manager, returns the getPackageInfo function for it
 *
 * @param packageManager the name and version of the package manager
 * @returns the getPackageInfo function for the package manager
 */
export function getPackageInfoFunction(
	packageManager: Pick<PackageManager, 'name' | 'version'>,
): GetPackageInfo {
	switch (packageManager.name) {
		case 'npm':
		case 'pnpm':
			return getNpmOrPnpmGetPackageInfoFunction(packageManager.name);
		case 'yarn':
			return getYarnGetPackageInfoFunction(packageManager.version);
		case 'bun':
			return getBunGetPackageInfoFunction();
		default:
			throw new Error(`Unexpected package manager: ${packageManager.name}`);
	}
}
