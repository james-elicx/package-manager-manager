import shellac from 'shellac';
import type { PackageManager } from '../packageManager';
import type { GetPackageInfo } from './index';

export function getYarnGetPackageInfoFunction(
	packageManager: Pick<PackageManager, 'name' | 'version'>,
) {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		try {
			let version: string | undefined;
			// TODO: use isYarnClassic util from PR #19
			const isYarnClassic =
				packageManager.name === 'yarn' && packageManager.version.startsWith('1.');

			if (isYarnClassic) {
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
