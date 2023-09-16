import { writeFile } from 'node:fs/promises';
// eslint-disable-next-line import/no-extraneous-dependencies
import mockFs from 'mock-fs';
import type { PackageManagerName } from '../../src/packageManager';

type SetupFsForOptions = {
	forWorkspace: boolean;
};

/**
 * Sets up the mock filesystem for a standard
 *
 * @param pm Name of the package Manager
 * @param options Options for the setup
 */
export async function setupFsForTesting(
	pm: PackageManagerName,
	{ forWorkspace = false }: Partial<SetupFsForOptions> = {},
): Promise<void> {
	const lockFileName = {
		npm: 'package-lock.json',
		yarn: 'yarn.lock',
		pnpm: 'pnpm-lock.yaml',
		bun: 'bun.lockb',
	}[pm];

	if (!forWorkspace) {
		mockFs({
			'package.json': '',
			[lockFileName]: '',
		});
	} else {
		mockFs({
			'package.json': '',
		});
		await writeFile('../../package.json', '');
		await writeFile(`../../${lockFileName}`, '');
	}
}
