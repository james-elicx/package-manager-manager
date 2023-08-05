import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cwd } from 'node:process';
import { isLockFile } from './locks';

type ProjectRootDirInfo = {
	path: string;
	files: string[];
};

/**
 * Gets the project's root directory
 * in case of standard/simple setups this is the project directory
 * in case of workspaces/monorepos the very root of it
 */
export async function getProjectRootDir(path = cwd()): Promise<ProjectRootDirInfo> {
	const files = await readdir(path);

	const hasPackageJson = files.includes('package.json');

	const hasLockFile = files.some(isLockFile);

	if (hasPackageJson && hasLockFile) {
		return {
			path,
			files: await readdir(path),
		};
	}

	const parentDir = resolve(join(path, '..'));
	if (parentDir !== '/') {
		return getProjectRootDir(parentDir);
	}

	throw new Error('failed to determine project root directory');
}
