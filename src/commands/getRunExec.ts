import type { PackageManagerName } from 'src/packageManager';
import type { CommandExecStruct } from './CommandStruct';

class RunExecStruct implements CommandExecStruct {
	pmKeywords: string[];

	args: string[];

	#argsDoubleDashes = '';

	constructor(
		packageManager: PackageManagerName,
		public command: string,
		options?: Partial<GetRunExecOptions>,
	) {
		this.args = options?.args ?? [];

    const format = options?.format ?? 'short';
    const download = options?.download ?? 'prefer-always';

		this.pmKeywords = RunExecStruct.#pmKeywords(packageManager, format, download);

		this.#argsDoubleDashes = ['npm', 'bun'].includes(packageManager) ? ' --' : '';
	}

	toString(): string {
		return `${this.pmKeywords.join(' ')} ${this.command}${
			this.args.length ? `${this.#argsDoubleDashes} ${this.args.join(' ')}` : ''
		}`;
	}

	static #pmKeywords(
		packageManager: PackageManagerName,
    format: 'short'|'full',
		download: DownloadPreference,
	): string[] {
    if(packageManager === 'bun') return format === 'short' ? ['bunx'] : ['bun', 'x'];
    if (packageManager === 'npm') return format === 'short' ? ['npx'] : ['npm', 'exec'];

    if(download === 'prefer-always') {
      return [packageManager, 'dlx'];
    }
    if(download === 'prefer-never') {
      return [packageManager, 'exec'];
    }
    throw new Error("TO IMPLEMENT");
	}
}

export type GetRunExecOptions = {
	/**
	 * The arguments to pass to the command (e.g. `-h`, `--info`, etc...)
	 *
	 * defaults to `[]`
	 */
	args: string[];
  /**
	 * Wether the command represents a full command or a shortened one
	 * (i.e. whether unnecessary keywords are removed/compressed or not)
	 * (e.g. short format = `'npx eslint'`, long format = `'npm exec eslint'`)
	 *
	 * defaults to `'short'`
	 */
	format: 'full' | 'short';
  /**
   * Indication of how the resulting command should be set up in regards of downloading
   * missing packages (this option does not guarantee a specific behavior as this heavily
   * relies on the underlying package manager in use)
   *
   * defaults to `'prefer-always'`
   */
  download: DownloadPreference;
};

type DownloadPreference = 'prefer-never'|'prefer-always'|'prefer-if-needed';

export type GetRunExec = (
	command: string,
	options?: Partial<GetRunExecOptions>,
) => string | null;

export type GetRunExecStruct = (
	command: string,
	options?: Partial<GetRunExecOptions>,
) => CommandExecStruct | null;

export function getRunExecFunctions(packageManager: PackageManagerName): {
	getRunExec: GetRunExec;
	getRunExecStruct: GetRunExecStruct;
} {
	const getRunExecStruct: GetRunExecStruct = (command, options) => {
		if (!command) return null;
		return new RunExecStruct(packageManager, command, options);
	};

	const getRunExec: GetRunExec = (...args) => getRunExecStruct(...args)?.toString() ?? null;

	return { getRunExec, getRunExecStruct };
}
