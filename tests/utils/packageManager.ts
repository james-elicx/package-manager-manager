import { getPackageManager } from '../../src/packageManager';
import type { PackageManager, PackageManagerName } from '../../src/packageManager';
import { setupFsForTesting } from './fsSetup';

/**
 * Creates a package manager that can be used to test the various functionalities of a PackageManager object
 *
 * @param pm Name of the package manager
 * @param version of the package manager
 * @param setTerminalOutput function that can mock the terminal standard output (needed to mock the package manager version)
 */
export async function getPackageManagerForTesting(
	pm: PackageManagerName,
	version?: string,
	setTerminalOutput?: (str: string) => void,
): Promise<PackageManager> {
	if (version) {
		if (!setTerminalOutput) {
			throw new Error(
				`Error: if you provide a version to mock you also need to provide a setTerminalOutput`,
			);
		}
		setTerminalOutput(version);
	}
	process.env['npm_config_user_agent'] = `${pm}/v node/v linux`;
	await setupFsForTesting(pm);
	const packageManager = await getPackageManager();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return packageManager!;
}
