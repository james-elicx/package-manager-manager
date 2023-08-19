import { getPackageManager} from "src/packageManager";
import type { PackageManager, PackageManagerName } from "src/packageManager";
import { setupFsForTesting } from "./fsSetup";

/**
 * Sets up the mock filesystem for a standard
 *
 * @param pm Name of the package Manager
 * @param options Options for the setup
 */
export async function getPackageManagerForTesting(pm: PackageManagerName): Promise<PackageManager> {
  await setupFsForTesting(pm);
  const packageManager = await getPackageManager();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return packageManager!;
}