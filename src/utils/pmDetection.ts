import type { PackageManagerName } from 'src/packageManager';
import { lockFiles } from './locks';
import { getProjectRootDir } from './workspace';

export function detectPackageManagerBasedOnUserAgent(): PackageManagerName | null {
	const npmConfigUserAgent = process.env['npm_config_user_agent'];

	if (!npmConfigUserAgent) {
		return null;
	}

	const pmInfo = npmConfigUserAgent.split(' ')[0];

	const matchedPm = pmInfo?.match(/^(npm|yarn|pnpm|bun)\//)?.[1] as PackageManagerName | undefined;

	return matchedPm ?? null;
}

export async function detectPackageManagerBasedOnFiles(): Promise<PackageManagerName | null> {
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
	packageManagerName: PackageManagerName | null;
	userAgentPackageManager: PackageManagerName | null;
	filesBasedPackageManager: PackageManagerName | null;
}> {
	const userAgentPackageManager = detectPackageManagerBasedOnUserAgent();
	const filesBasedPackageManager = await detectPackageManagerBasedOnFiles();

	const packageManagerName = userAgentPackageManager ?? filesBasedPackageManager;

	return {
		packageManagerName,
		userAgentPackageManager,
		filesBasedPackageManager,
	};
}
