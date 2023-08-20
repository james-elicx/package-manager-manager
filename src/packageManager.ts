import shellac from 'shellac';
import type { GetRunScript, GetRunScriptStruct } from './commands';
import { getRunScriptFunctions } from './commands';
import { getPackageInfoFunction, type GetPackageInfo } from './package';
import { getProjectRootDir, lockFiles } from './utils';

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Object containing all the information and utilities regarding the current package manager
 */
export type PackageManager = {
	/** The name of the package manager (one of `'npm'`, `'yarn'`, `'pnpm'` or `'bun'`) */
	name: PackageManagerName;
	/** The version of the package manager */
	version: string;
	/**
	 * Utility to get the information of an installed package
	 *
	 * @param packageName the name of the target package
	 * @returns the information about the package or null if the package is not installed
	 */
	getPackageInfo: GetPackageInfo;
	/**
	 * Gets the command needed to run a specified script.
	 *
	 * @param script the script to run (e.g. `'start'`, `'lint'`, etc...)
	 * @param options options Options indicating how the script should be created
	 * @returns a string representing the command needed to run the script, or null if the provided input script is invalid
	 */
	getRunScript: GetRunScript;
	/**
	 * Gets an structured representation for the command needed to run a specified script.
	 *
	 * @param script the script to run (e.g. `'start'`, `'lint'`, etc...)
	 * @param options Options indicating how the script should be created
	 * @returns an object representing the command needed to run the script, or null if the provided input script is invalid
	 */
	getRunScriptStruct: GetRunScriptStruct;
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
			const name = packageManagerName;
			const version = await getPackageManagerVersion(packageManagerName);
			const getPackageInfo = getPackageInfoFunction({ name, version });
			const { getRunScript, getRunScriptStruct } = getRunScriptFunctions(name);
			return {
				name,
				version,
				getPackageInfo,
				getRunScript,
				getRunScriptStruct,
			};
		}
	}

	return null;
}
