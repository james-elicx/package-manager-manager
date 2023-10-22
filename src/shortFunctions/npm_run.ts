import { parse as shellQuoteParse } from 'shell-quote';
import type { GetRunScriptOptions } from 'src/commands';
import type { PackageManager } from '../packageManager';
import { getPackageManager } from '../packageManager';

type NpmRunOptions = Partial<Omit<GetRunScriptOptions, 'args'>>;

// the current package manager (we use a local variable here to cache it
// so that it not re-created for each invocation of npm_run)
let pm: PackageManager | null = null;

function getNpmRunFunction(options: NpmRunOptions = {}) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return async function npm_run(
		strings: TemplateStringsArray,
		...values: unknown[]
	): Promise<string> {
		if (!strings[0]) {
			throw new Error('Malformed npm run command');
		}

		// Note: we don't do anything clever with the values (at least for now)
		// we're using template string literals mainly for the minimalistic api
		const inputString = values.reduce((accStr: string, value, index) => {
			return `${accStr}___${value}___${strings[index + 1]}`;
		}, strings[0]);

		if (!pm) {
			pm = await getPackageManager();
		}

		if (!pm) {
			throw new Error('No package manager!');
		}

		const [script, doubleDashes, ...scriptArgs] = shellQuoteParse(inputString).map((e) =>
			e.toString(),
		);

		if (!script) {
			throw new Error('Malformed npm run command (no script provided)');
		}

		if (doubleDashes && doubleDashes !== '--') {
			throw new Error('Malformed npm run command (no double dashes provided)');
		}

		const result = await pm.getRunScript(script, {
			...options,
			args: scriptArgs,
		});

		if (!result) {
			throw new Error('Failed to generate the script');
		}

		return result;
	};
}

/**
 * Function to generate a script command string for the current package manager.
 * It accepts all the same arguments that `npm run` does.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const npm_run = getNpmRunFunction() as ReturnType<typeof getNpmRunFunction> & {
	/**
	 * Method used to provide some options to the `npm_run` function.
	 */
	with: (options: NpmRunOptions) => ReturnType<typeof getNpmRunFunction>;
};

npm_run.with = function npxWith(options: NpmRunOptions) {
	return getNpmRunFunction(options);
};
