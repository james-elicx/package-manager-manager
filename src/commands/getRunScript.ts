import type { PackageManager } from '../packageManager';
import type { CommandScriptStruct } from './CommandStruct';

class RunScriptStruct implements CommandScriptStruct {
	pmKeywords: string[];

	args: string[];

	argsNeedDoubleDashes: boolean;

	constructor(
		packageManager: Pick<PackageManager, 'name' | 'cliCommandKeywords'>,
		public script: string,
		options?: Partial<GetRunScriptOptions>,
	) {
		this.args = options?.args ?? [];

		const format = options?.format ?? 'short';

		const includeRun = RunScriptStruct.#shouldRunKeywordBeIncluded(packageManager, script, format);
		this.pmKeywords = [packageManager.name, ...(includeRun ? ['run'] : [])];

		this.argsNeedDoubleDashes = ['npm', 'bun'].includes(packageManager.name);
	}

	toString(): string {
		return `${this.pmKeywords.join(' ')} ${this.script}${
			this.args.length ? `${this.argsNeedDoubleDashes ? ' --' : ''} ${this.args.join(' ')}` : ''
		}`;
	}

	static #shouldRunKeywordBeIncluded(
		packageManager: Pick<PackageManager, 'name' | 'cliCommandKeywords'>,
		script: string,
		format: GetRunScriptOptions['format'],
	): boolean {
		if (format === 'full') return true;

		if (script === 'start') return false;

		if (packageManager.name === 'npm') return true;

		const scriptCollidesWithCliKeyword = packageManager.cliCommandKeywords.has(script);
		if (scriptCollidesWithCliKeyword) return true;

		return false;
	}
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

export type GetRunScriptStruct = (
	script: string,
	options?: Partial<GetRunScriptOptions>,
) => CommandScriptStruct | null;

export function getRunScriptFunctions(
	packageManager: Pick<PackageManager, 'name' | 'cliCommandKeywords'>,
): {
	getRunScript: GetRunScript;
	getRunScriptStruct: GetRunScriptStruct;
} {
	const getRunScriptStruct: GetRunScriptStruct = (script, options) => {
		if (!script) return null;
		return new RunScriptStruct(packageManager, script, options);
	};

	const getRunScript: GetRunScript = (...args) => getRunScriptStruct(...args)?.toString() ?? null;

	return { getRunScript, getRunScriptStruct };
}
