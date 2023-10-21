import { shellac } from '../utils';
import type { GetPackageInfo } from './index';

export function getPnpmGetPackageInfoFunction() {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		try {
			const listOutput = (await shellac`$ pnpm list --depth=0`).stdout;

			const versionRegex = new RegExp(`^${name}\\s+(.*)$`, 'im');

			const match = listOutput.match(versionRegex);
			const version = match?.[1];

			if (!version) {
				return null;
			}

			return { name, version };
		} catch {
			throw new Error(`An error occurred while gathering the package info of "${name}"`);
		}
	};
}
