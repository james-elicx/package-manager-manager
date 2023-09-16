import type { PackageManager } from '../packageManager';
import { isYarnClassic } from '../utils';
import type { CommandExecStruct } from './CommandStruct';

class RunExecStruct implements CommandExecStruct {
	structIsReady: Promise<void>;

	pmKeywords: string[] = [];

	args: string[];

	#argsDoubleDashes: string;

	constructor(
		packageManager: Pick<PackageManager, 'name' | 'version' | 'getPackageInfo'>,
		public command: string,
		options?: Partial<GetRunExecOptions>,
	) {
		this.args = options?.args ?? [];

		const format = options?.format ?? 'short';
		const download = options?.download ?? 'prefer-always';

		this.structIsReady = new Promise((resolve) => {
			RunExecStruct.#getPmKeywords(packageManager, command, format, download).then((pmKeywords) => {
				this.pmKeywords = pmKeywords;

				if (['yarn', 'pnpm'].includes(packageManager.name) && pmKeywords[1] === 'exec') {
					this.command = RunExecStruct.#unscopeCommand(this.command);
				}
				const isNpmExec = packageManager.name === 'npm' && this.pmKeywords[1] === 'exec';
				if (isNpmExec) {
					this.#argsDoubleDashes = ' --';
				}
				resolve();
			});
		});

		this.#argsDoubleDashes = isYarnClassic(packageManager) ? ' --' : '';
	}

	toString(): string {
		return `${this.pmKeywords.join(' ')} ${this.command}${
			this.args.length ? `${this.#argsDoubleDashes} ${this.args.join(' ')}` : ''
		}`;
	}

	static async #getPmKeywords(
		packageManager: Pick<PackageManager, 'name' | 'version' | 'getPackageInfo'>,
		command: string,
		format: 'short' | 'full',
		download: DownloadPreference,
	): Promise<string[]> {
		switch (packageManager.name) {
			case 'bun':
				return format === 'short' ? ['bunx'] : ['bun', 'x'];
			case 'npm':
				return format === 'short' ? ['npx'] : ['npm', 'exec'];
			case 'yarn':
				if (packageManager.version.startsWith('1.')) {
					// yarn classic doesn't have dlx
					return ['yarn', 'exec'];
				}
				break;
			default:
		}

		let result: string[] = [];
		// eslint-disable-next-line default-case
		switch (download) {
			case 'prefer-always':
				result = [packageManager.name, 'dlx'];
				break;
			case 'prefer-never':
				result = [packageManager.name, 'exec'];
				break;
			case 'prefer-if-needed': {
				const isPackageInstalled = await packageManager.getPackageInfo(command);
				result = [packageManager.name, isPackageInstalled ? 'exec' : 'dlx'];
				break;
			}
		}

		return result;
	}

	/**
	 * Unscopes a given command, for example it converts "@org/my-cmd" to "my-cmd"
	 * (already non scoped commands are left untouched)
	 *
	 * @param command the command to potentially unscope
	 * @returns the unscoped version of the provided command
	 */
	static #unscopeCommand(command: string): string {
		const match = command.match(/^@[^/]+\/(.*)/);
		return match?.[1] ?? command;
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

type DownloadPreference = 'prefer-never' | 'prefer-always' | 'prefer-if-needed';

export type GetRunExec = (
	command: string,
	options?: Partial<GetRunExecOptions>,
) => Promise<string | null>;

export type GetRunExecStruct = (
	command: string,
	options?: Partial<GetRunExecOptions>,
) => Promise<CommandExecStruct | null>;

export function getRunExecFunctions(
	packageManager: Pick<PackageManager, 'name' | 'version' | 'getPackageInfo'>,
): {
	getRunExec: GetRunExec;
	getRunExecStruct: GetRunExecStruct;
} {
	const getRunExecStruct: GetRunExecStruct = async (command, options) => {
		if (!command) return null;
		const struct = new RunExecStruct(packageManager, command, options);
		await struct.structIsReady;
		return struct;
	};

	const getRunExec: GetRunExec = async (...args) =>
		(await getRunExecStruct(...args))?.toString() ?? null;

	return { getRunExec, getRunExecStruct };
}
