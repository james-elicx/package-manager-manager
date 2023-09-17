type CommandStructBase = {
	/**
	 * Package Manager specific keywords that representing the command to run
	 * (e.g. `['pnpm', 'exec']`, `['yarn', 'dlx']`, etc...)
	 */
	pmKeywords: string[];
	/**
	 * The arguments passed to the target command
	 * (e.g. `['--help']`, `['./dist']`, `['--ignore-path', '.gitignore']`, etc...)
	 */
	args: string[]; // basically spitting out what the user provided
	/**
	 * Flag indicating whether double dashes need to prepend the command's arguments.
	 */
	argsNeedDoubleDashes: boolean;
	/**
	 * Method to print the command ready for use
	 * (e.g. `'npm run dev'`, `'pnpm dlx eslint --fix --quiet'`, etc...)
	 */
	toString(): string;
};

export type CommandExecStruct = CommandStructBase & {
	/**
	 * The command (from some dependency) the object is targeting
	 * (e.g. `'eslint'`, `'esbuild'`, `'prettier'`, etc...)
	 */
	command: string;
};

export type CommandScriptStruct = CommandStructBase & {
	/**
	 * The script (as present in package.json) the object is targeting
	 * (e.g. `'my-script'`, `'build'`, `'test'`, etc...)
	 */
	script: string;
};
