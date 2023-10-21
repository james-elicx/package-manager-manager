import type { PackageManager, PackageManagerMetadata } from '../packageManager';

import { getBunGetPackageInfoFunction } from './bun';
import { getNpmGetPackageInfoFunction } from './npm';
import { getPnpmGetPackageInfoFunction } from './pnpm';
import { getYarnGetPackageInfoFunction } from './yarn';

/**
 * The subset of properties of PackageManager that are relevant when dealing with packages
 */
type PackageManagerForPackages = Pick<PackageManager, 'name' | 'version'> & {
	metadata: Pick<PackageManagerMetadata, 'isYarnClassic'>;
};

export type PackageInfo = {
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
export function getPackageInfoFunction(packageManager: PackageManagerForPackages): GetPackageInfo {
	switch (packageManager.name) {
		case 'npm':
			return getNpmGetPackageInfoFunction();
		case 'pnpm':
			return getPnpmGetPackageInfoFunction();
		case 'yarn':
			return getYarnGetPackageInfoFunction(packageManager);
		case 'bun':
			return getBunGetPackageInfoFunction();
		default:
			throw new Error(`Unexpected package manager: ${packageManager.name}`);
	}
}
