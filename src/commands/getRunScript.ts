import type { PackageManagerName } from 'src/packageManager';
import type { CommandScriptObject } from './CommandObject';

function shouldRunKeywordBeIncluded(
	packageManager: PackageManagerName,
	script: string,
	format: GetRunScriptOptions['format'],
): boolean {
	if (format === 'full') return true;

	if (script === 'start') return false;

	if (packageManager === 'npm') return true;

	// TODO: `run` is also necessary when scripts have the same name as package managers reserved keywords, we aren't currently
	//       accounting for that, we should add here the proper checks for that
	//       (e.g. `pnpm info` runs the `info` command, but `pnpm run info` runs the `info` script, but here we don't consider
	//       that and always remove the `run` making the script command result invalid)

	return false;
}

function getGetRunScriptObject(packageManager: PackageManagerName): GetRunScriptObject {
	return (script, options) => {
		if (!script) return null;

		const args = options?.args ?? [];

		const format = options?.format ?? 'short';

		const includeRun = shouldRunKeywordBeIncluded(packageManager, script, format);
		const pmKeywords = [packageManager, ...(includeRun ? ['run'] : [])];

		const argsDoubleDashes = ['npm', 'bun'].includes(packageManager) ? ' --' : '';

		return {
			pmKeywords,
			script,
			args,
			toString: () => {
				return `${pmKeywords.join(' ')} ${script}${
					args.length ? `${argsDoubleDashes} ${args.join(' ')}` : ''
				}`;
			},
		};
	};
}

function getGetRunScript(getRunScriptObject: GetRunScriptObject): GetRunScript {
	return (...args) => {
		const obj = getRunScriptObject(...args);
		return obj?.toString() ?? null;
	};
}

export type GetRunScriptOptions = {
	/**
	 * The arguments to pass to the script (e.g. `-h`, `--info`, etc...)
	 *
	 * defaults to `[]`
	 */
	args: string[];
	/**
	 * Wether the command represents a full command or a shortened one
	 * (i.e. whether unnecessary keywords are removed or not)
	 * (e.g. short format = `'pnpm dev'`, long format = `'pnpm run dev'`)
	 *
	 * defaults to `'short'`
	 */
	format: 'full' | 'short';
};

export type GetRunScript = (
	script: string,
	options?: Partial<GetRunScriptOptions>,
) => string | null;

export type GetRunScriptObject = (
	script: string,
	options?: Partial<GetRunScriptOptions>,
) => CommandScriptObject | null;

export function getRunScriptFunctions(packageManager: PackageManagerName): {
	getRunScriptObject: GetRunScriptObject;
	getRunScript: GetRunScript;
} {
	const getRunScriptObject = getGetRunScriptObject(packageManager);

	const getRunScript = getGetRunScript(getRunScriptObject);

	return { getRunScriptObject, getRunScript };
}
