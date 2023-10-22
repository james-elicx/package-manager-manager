import { parse as shellQuoteParse } from 'shell-quote';
import type { GetRunExecOptions } from '../commands';
import { getPackageManager } from '../packageManager';

type NpxOptions = Partial<Omit<GetRunExecOptions, 'args'>>;

function getNpxFunction(options: NpxOptions = {}) {
	return async function npx(strings: TemplateStringsArray, ...values: unknown[]): Promise<string> {
		if (!strings[0]) {
			throw new Error('Malformed npm run command');
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
			throw new Error('Malformed npm run command (no script provided)');
		}

		const result = await pm.getRunExec(command, {
			...options,
			args: commandArgs,
		});

		if (!result) {
			throw new Error('Failed to generate the script');
		}

		return result;
	};
}

export const npx = getNpxFunction() as ReturnType<typeof getNpxFunction> & {
	with: (options: NpxOptions) => ReturnType<typeof getNpxFunction>;
};

npx.with = function npxWith(options: NpxOptions) {
	return getNpxFunction(options);
};
