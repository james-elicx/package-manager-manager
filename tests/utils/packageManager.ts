import { getPackageManager } from 'src/packageManager';
import type { PackageManager, PackageManagerName } from 'src/packageManager';
import { setupFsForTesting } from './fsSetup';

/**
 * Creates a package manager that can be used to test the various functionalities of a PackageManager object
 *
 * @param pm Name of the package Manager
 */
export async function getPackageManagerForTesting(pm: PackageManagerName): Promise<PackageManager> {
	await setupFsForTesting(pm);
	const packageManager = await getPackageManager();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return packageManager!;
}
