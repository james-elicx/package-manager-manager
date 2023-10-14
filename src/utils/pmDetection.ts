import type { PackageManagerName } from "src/packageManager";
import { lockFiles } from "./locks";
import { getProjectRootDir } from "./workspace";

export async function detectPackageManagerBasedOnFiles(): Promise<PackageManagerName|null> {
  const projectRootDir = await getProjectRootDir();

	if (!projectRootDir) {
		return null;
	}

	const projectRootFiles = projectRootDir.files;

	for (const key of Object.keys(lockFiles)) {
		const packageManagerName = key as keyof typeof lockFiles;
		if (projectRootFiles.includes(lockFiles[packageManagerName])) {
      return packageManagerName;
    }
  }

  return null;
}

export async function detectPackageManagerName(): Promise<{
  packageManagerName: PackageManagerName|null,
  userAgentPackageManager: PackageManagerName|null,
  filesBasedPackageManager: PackageManagerName|null,
}> {
  const filesBasedPackageManager = await detectPackageManagerBasedOnFiles();

  return {
    packageManagerName: null,
    userAgentPackageManager: null,
    filesBasedPackageManager,
  }
}
