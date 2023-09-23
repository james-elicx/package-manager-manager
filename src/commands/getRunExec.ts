import type { PackageManager } from '../packageManager';
import { isYarnClassic } from '../utils';
import type { CommandExecStruct } from './CommandStruct';

class RunExecStruct implements CommandExecStruct {
	structIsReady: Promise<void>;

	cmd: string;

	pmCmd?: string = undefined;

	targetArgs: string[];

	argsNeedDoubleDashes: boolean;

	constructor(
		packageManager: Pick<PackageManager, 'name' | 'version' | 'getPackageInfo'>,
		public pkgCmd: string,
		options?: Partial<GetRunExecOptions>,
	) {
		this.targetArgs = options?.args ?? [];

		const format = options?.format ?? 'short';
		const download = options?.download ?? 'prefer-always';

		this.cmd = packageManager.name;
		this.structIsReady = new Promise((resolve) => {
			RunExecStruct.#getPmKeywords(packageManager, pkgCmd, format, download).then(
				({ cmd, pmCmd }) => {
					this.cmd = cmd;
					this.pmCmd = pmCmd;

					if (['yarn', 'pnpm'].includes(packageManager.name) && pmCmd === 'exec') {
						this.pkgCmd = RunExecStruct.#unscopeCommand(this.pkgCmd);
					}
					const isNpmExec = packageManager.name === 'npm' && this.pmCmd === 'exec';
					if (isNpmExec) {
						this.argsNeedDoubleDashes = true;
					}
					resolve();
				},
			);
		});

		this.argsNeedDoubleDashes = isYarnClassic(packageManager);
	}

	get cmdArgs(): string[] {
		return [
			...(this.pmCmd ? [this.pmCmd] : []),
			this.pkgCmd,
			...(this.targetArgs.length && this.argsNeedDoubleDashes ? ['--'] : []),
			...(this.targetArgs)
		];
	}

	toString(): string {
		return `${this.cmd}${this.pmCmd ? ` ${this.pmCmd}` : ''} ${this.pkgCmd}${
			this.targetArgs.length ? `${this.argsNeedDoubleDashes ? ' --' : ''} ${this.targetArgs.join(' ')}` : ''
		}`;
	}

	static async #getPmKeywords(
		packageManager: Pick<PackageManager, 'name' | 'version' | 'getPackageInfo'>,
		command: string,
		format: 'short' | 'full',
		download: DownloadPreference,
	): Promise<{ cmd: string; pmCmd?: string }> {
		switch (packageManager.name) {
			case 'bun':
				return format === 'short' ? { cmd: 'bunx' } : { cmd: 'bun', pmCmd: 'x' };
			case 'npm':
				return format === 'short' ? { cmd: 'npx' } : { cmd: 'npm', pmCmd: 'exec' };
			case 'yarn':
				if (packageManager.version.startsWith('1.')) {
					// yarn classic doesn't have dlx
					return { cmd: 'yarn', pmCmd: 'exec' };
				}
				break;
			default:
		}

		const result: { cmd: string; pmCmd?: string } = { cmd: packageManager.name };
		// eslint-disable-next-line default-case
		switch (download) {
			case 'prefer-always':
				result.pmCmd = 'dlx';
				break;
			case 'prefer-never':
				result.pmCmd = 'exec';
				break;
			case 'prefer-if-needed': {
				const isPackageInstalled = await packageManager.getPackageInfo(command);
				result.pmCmd = isPackageInstalled ? 'exec' : 'dlx';
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
