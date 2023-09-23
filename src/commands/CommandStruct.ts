type CommandStructBase = {
	/**
	 * Package manager command to run (`npm`, `npx`, `yarn`, `pnpm`, `bun` or `bunx`)
	 */
	cmd: string;
	/**
	 * Package Manager specific keyword that representing the command to run (if any)
	 * (e.g. `run`, `exec`, `dlx`, etc...)
	 */
	pmCommand?: string;
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
