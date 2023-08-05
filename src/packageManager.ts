import { getProjectRootDir, lockFiles } from './utils';

type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

type PackageManager = {
	name: PackageManagerName;
};

export async function getPackageManager(): Promise<PackageManager> {
	const { files: projectRootFiles } = await getProjectRootDir();

	for (const key of Object.keys(lockFiles)) {
		const packageManagerName = key as keyof typeof lockFiles;
		if (projectRootFiles.includes(lockFiles[packageManagerName])) {
			return {
				name: packageManagerName,
			};
		}
	}

	throw new Error('no package manager detected');
}
