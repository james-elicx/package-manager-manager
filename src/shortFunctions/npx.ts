import { parse as shellQuoteParse } from 'shell-quote';
import type { GetRunExecOptions } from '../commands';
import { getPackageManager } from '../packageManager';

type NpxOptions = Partial<Omit<GetRunExecOptions, 'args'>>;

function getNpxFunction(options: NpxOptions = {}) {
	return async function npx(strings: TemplateStringsArray, ...values: unknown[]): Promise<string> {
		if (!strings[0]) {
			throw new Error('Malformed npx command');
		}

		// Note: we don't do anything clever with the values (at least for now)
		// we're using template string literals mainly for the minimalistic api
		const inputString = values.reduce((accStr: string, value, index) => {
			return `${accStr}___${value}___${strings[index + 1]}`;
		}, strings[0]);

		const pm = await getPackageManager();

		if (!pm) {
			throw new Error('No package manager!');
		}

		const [command, ...commandArgs] = shellQuoteParse(inputString).map((e) => e.toString());

		if (!command) {
			throw new Error('Malformed npx command (no command provided)');
		}

		const result = await pm.getRunExec(command, {
			...options,
			args: commandArgs,
		});

		if (!result) {
			throw new Error('Failed to generate the exec command');
		}

		return result;
	};
}

/**
 * Function to generate an exec command string for the current package manager.
 * It accepts all the same arguments that `npx` does.
 */
export const npx = getNpxFunction() as ReturnType<typeof getNpxFunction> & {
	/**
	 * Method used to provide some options to the `npx` function.
	 */
	with: (options: NpxOptions) => ReturnType<typeof getNpxFunction>;
};

npx.with = function npxWith(options: NpxOptions) {
	return getNpxFunction(options);
};
