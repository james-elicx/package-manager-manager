import shellac from 'shellac';
import { getProjectRootDir, lockFiles } from './utils';

type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

type PackageManager = {
	name: PackageManagerName;
	version: string;
};

async function getPackageManagerVersion(packageManager: PackageManagerName): Promise<string> {
	const { stdout } = await shellac`$ ${packageManager} --version`;
	return stdout;
}

/**
 * Gets the current package manager information based on the current directory
 *
 * @returns the current package manager information, or null if no package manager could be detected
 */
export async function getPackageManager(): Promise<PackageManager | null> {
	const projectRootDir = await getProjectRootDir();

	if (!projectRootDir) {
		return null;
	}

	const projectRootFiles = projectRootDir.files;

	for (const key of Object.keys(lockFiles)) {
		const packageManagerName = key as keyof typeof lockFiles;
		if (projectRootFiles.includes(lockFiles[packageManagerName])) {
			return {
				name: packageManagerName,
				version: await getPackageManagerVersion(packageManagerName),
			};
		}
	}

	return null;
}
