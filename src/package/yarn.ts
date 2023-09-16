import shellac from 'shellac';
import type { PackageManager } from '../packageManager';
import { isYarnClassic } from '../utils';
import type { GetPackageInfo } from './index';

export function getYarnGetPackageInfoFunction(
	packageManager: Pick<PackageManager, 'name' | 'version'>,
) {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		try {
			let version: string | undefined;

			if (isYarnClassic(packageManager)) {
				const commandOutput = (await shellac`$ yarn list pattern ${name}`).stdout;

				const versionRegex = new RegExp(`^[└─\\s]*${name}@(\\S*)`, 'im');
				const match = commandOutput.match(versionRegex);
				version = match?.[1];
			} else {
				const commandOutput = (await shellac`$ yarn why ${name}`).stdout;

				const versionRegex = new RegExp(`^[└─\\s]*${name}@(?:\\S+:)?(\\S*)`, 'im');
				const match = commandOutput.match(versionRegex);
				version = match?.[1];
			}

			if (!version) {
				return null;
			}

			return { name, version };
		} catch {
			throw new Error(`An error occurred while gathering the package info of "${name}"`);
		}
	};
}
