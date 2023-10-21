import type { GetRunExec, GetRunExecStruct, GetRunScript, GetRunScriptStruct } from './commands';
import { getRunExecFunctions, getRunScriptFunctions } from './commands';
import { getPackageInfoFunction, type GetPackageInfo } from './package';
import { getPmCliCommandKeywords, detectPackageManagerName, shellac } from './utils';

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Object containing all the information and utilities regarding the current package manager
 */
export type PackageManager = {
	/** The name of the current package manager (one of `'npm'`, `'yarn'`, `'pnpm'` or `'bun'`) */
	name: PackageManagerName;
	/** The name of the package manager the project in the current directory is set up for (if any), which might
	 * be different from the package manager's name in the case the package manager being used is different from
	 * the one the project is supposed to be used with (e.g. if the current process is running via `npm` inside a
	 * project set up using `pnpm`) */
	projectPackageManager: PackageManagerName | null;
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
	/**
	 * Gets the command needed to run a specified command from a local or remote package
	 *
	 * @param command the (package) command to run (e.g. `'eslint'`, `'prettier'`, etc...)
	 * @param options options Options indicating how the command should be created
	 * @returns a string representing the command needed to run the package command, or null if the provided input package command is invalid
	 */
	getRunExec: GetRunExec;
	/**
	 * Gets the command needed to run a specified command from a local or remote package
	 *
	 * @param command the (package) command to run (e.g. `'eslint'`, `'prettier'`, etc...)
	 * @param options options Options indicating how the command should be created
	 * @returns a string representing the command needed to run the package command, or null if the provided input package command is invalid
	 */
	getRunExecStruct: GetRunExecStruct;
	/**
	 * Set of all (reserved) command keywords for the package manager.
	 *
	 * For example, for npm some of such keywords are: `install`, `uninstall` and `help`, but not that
	 * `npx` is not part of the set since it is a different command entirely and not a keyword used in npm (i.e. you don't run `npm npx`)
	 */
	cliCommandKeywords: Set<string>;
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
	const { packageManagerName, filesBasedPackageManager } = await detectPackageManagerName();

	if (packageManagerName) {
		const name = packageManagerName;
		const version = await getPackageManagerVersion(packageManagerName);
		const packageManager: PackageManager = {
			name: packageManagerName,
			version,
			projectPackageManager: filesBasedPackageManager,
			// initialization of dummy fields which get populated in the next steps
			cliCommandKeywords: new Set(),
			getPackageInfo: async () => null,
			getRunScript: async () => null,
			getRunScriptStruct: async () => null,
			getRunExec: async () => null,
			getRunExecStruct: async () => null,
		};

		packageManager.cliCommandKeywords = getPmCliCommandKeywords(packageManager);

		packageManager.getPackageInfo = getPackageInfoFunction({ name, version });

		const { getRunScript, getRunScriptStruct } = getRunScriptFunctions(packageManager);

		const { getRunExec, getRunExecStruct } = getRunExecFunctions(packageManager);

		packageManager.getRunScript = getRunScript;
		packageManager.getRunScriptStruct = getRunScriptStruct;

		packageManager.getRunExec = getRunExec;
		packageManager.getRunExecStruct = getRunExecStruct;

		return packageManager;
	}

	return null;
}
