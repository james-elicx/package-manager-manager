import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cwd } from 'node:process';
import { isLockFile } from './locks';

type ProjectRootDirInfo = {
	path: string;
	files: string[];
};

/**
 * Gets the project's root directory which is:
 *  - in case of standard/simple setups the project directory
 *  - in case of workspaces/monorepos the root of it
 *
 * It does so by checking the current path and potentially traversing up the directory tree
 * until it finds a directory containing a `package.json` and a lock file
 *
 * @param path the path to start the search from (defaults to the current working directory)
 * @returns {Promise<ProjectRootDirInfo>}
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
