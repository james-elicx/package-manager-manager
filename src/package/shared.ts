import shellac from 'shellac';
import type { PackageManagerName } from '../packageManager';
import type { GetPackageInfo } from './index';

type NpmListOutputJsonDependency = {
	version: string;
	resolved: string;
};

type NpmListOutputJson = {
	version: string;
	name: string;
	dependencies?: Record<string, NpmListOutputJsonDependency>;
	devDependencies?: Record<string, NpmListOutputJsonDependency>;
};

export function getNpmOrPnpmGetPackageInfoFunction(
	packageManager: Extract<PackageManagerName, 'npm' | 'pnpm'>,
) {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		try {
			const outputJson = JSON.parse(
				(await shellac`$ ${packageManager} list --depth=0 --json`).stdout,
			);

			const info: NpmListOutputJson = packageManager === 'npm' ? outputJson : outputJson[0];
			const packageInfo = info.dependencies?.[name] ?? info.devDependencies?.[name];

			if (!packageInfo) {
				return null;
			}

			return { name, version: packageInfo.version };
		} catch {
			throw new Error(`An error occurred while gathering the package info of "${name}"`);
		}
	};
}
