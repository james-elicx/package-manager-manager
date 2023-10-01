import shellac from 'shellac';
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

export function getNpmGetPackageInfoFunction() {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		try {
			const listOutput = (await shellac`$ npm list --depth=0 --json`).stdout;

			const outputJson = JSON.parse(listOutput);

			const info: NpmListOutputJson = outputJson;
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
