import { shellac } from '../utils';
import type { GetPackageInfo } from './index';

export function getBunGetPackageInfoFunction() {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		try {
			const pmLsOutput = (await shellac`$ bun pm ls`).stdout;
			const versionRegex = new RegExp(`^[└─\\s]*${name}@(.*)$`, 'im');

			const match = pmLsOutput.match(versionRegex);
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
