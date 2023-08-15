import shellac from 'shellac';
import type { GetPackageInfo } from './index';

type Yarn1InfoOutputJson = {
	type: 'inspect';
	data: {
		name: string;
		version: string;
	};
};

type YarnBerryInfoOutputJson = {
	value: string;
	children: {
		Version: string;
	};
};

export function getYarnGetPackageInfoFunction(yarnVersion: string) {
	return async (...[name]: Parameters<GetPackageInfo>): ReturnType<GetPackageInfo> => {
		const yarnInfoCommand = `$ yarn info ${name} --json`;

		try {
			let version: string | undefined;
			if (yarnVersion.startsWith('1')) {
				const outputJson: Yarn1InfoOutputJson = JSON.parse(
					(await shellac`${yarnInfoCommand}`).stdout ?? 'null',
				);
				version = outputJson?.data.version;
			} else {
				try {
					let outputJsonStr = 'null';
					await shellac`
          ${yarnInfoCommand}

          stdout >> ${(json) => {
						outputJsonStr = json;
					}}

          exitcode >> ${(code) => {
						if (code !== '0') {
							outputJsonStr = 'null';
						}
					}}
        `;

					const outputJson: YarnBerryInfoOutputJson | null = JSON.parse(outputJsonStr);
					version = outputJson?.children.Version;
				} catch {
					/**/
				}
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
