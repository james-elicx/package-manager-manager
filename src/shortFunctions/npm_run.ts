import { parse as shellQuoteParse } from 'shell-quote';
import { getPackageManager } from '../packageManager';

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function npm_run(strings: TemplateStringsArray, ...values: unknown[]): Promise<string>{
  if(!strings[0]) {
    throw new Error('Malformed npm run command');
  }

  // Note: we don't do anything clever with the values (at least for now)
  // we're using template string literals mainly for the minimalistic api
  const inputString = values.reduce((accStr: string, value, index) => {
      return `${accStr}___${value}___${strings[index + 1]}`
  }, strings[0]);

  const pm = await getPackageManager();

  if(!pm) {
    throw new Error('No package manager!');
  }

  const [script, doubleDashes, ...scriptArgs] = shellQuoteParse(inputString).map(e => e.toString());

  if(!script) {
    throw new Error('Malformed npm run command (no script provided)');
  }

  if(doubleDashes !== '--' && scriptArgs.length > 0) {
    throw new Error('Malformed npm run command (no double dashes before args)');
  }

  const result = await pm.getRunScript(script, {
    args: scriptArgs
  });

  if(!result) {
    throw new Error('Failed to generate the script');
  }

  return result;
}