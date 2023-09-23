import type { PackageManager } from '../packageManager';
import type { CommandScriptStruct } from './CommandStruct';

class RunScriptStruct implements CommandScriptStruct {
	cmd: string;

	pmCmd?: string = undefined;

	targetArgs: string[];

	argsNeedDoubleDashes: boolean;

	constructor(
		packageManager: Pick<PackageManager, 'name' | 'cliCommandKeywords'>,
		public script: string,
		options?: Partial<GetRunScriptOptions>,
	) {
		this.targetArgs = options?.args ?? [];

		const format = options?.format ?? 'short';

		this.cmd = packageManager.name;
		const includeRun = RunScriptStruct.#shouldRunKeywordBeIncluded(packageManager, script, format);
		if (includeRun) {
			this.pmCmd = 'run';
		}

		this.argsNeedDoubleDashes = ['npm', 'bun'].includes(packageManager.name);
	}

	get cmdArgs(): string[] {
		return [
			...(this.pmCmd ? [this.pmCmd] : []),
			this.script,
			...(this.targetArgs.length && this.argsNeedDoubleDashes ? ['--'] : []),
			...(this.targetArgs)
		];
	}

	toString(): string {
		return `${this.cmd}${this.pmCmd ? ` ${this.pmCmd}` : ''} ${this.script}${
			this.targetArgs.length ? `${this.argsNeedDoubleDashes ? ' --' : ''} ${this.targetArgs.join(' ')}` : ''
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
