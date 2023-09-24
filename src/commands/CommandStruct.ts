type CommandStructBase = {
	/**
	 * Base command to run (`npm`, `npx`, `yarn`, `pnpm`, `bun` or `bunx`)
	 */
	cmd: string;
	/**
	 * All the arguments to provide to the base command.
	 *
	 * Note: this comprises everything except the base command, like the package manager
	 * specific command, its arguments, potential double-dashes, etc...
	 *
	 */
	cmdArgs: string[];
	/**
	 * Package Manager specific keyword that representing the command to run (if any)
	 * (e.g. `run`, `exec`, `dlx`, etc...)
	 */
	pmCmd?: string;
	/**
	 * The arguments passed to the target command
	 * (e.g. `['--help']`, `['./dist']`, `['--ignore-path', '.gitignore']`, etc...)
	 */
	targetArgs: string[];
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
	 * The package specific command (from some dependency) the object is targeting
	 * (e.g. `'eslint'`, `'esbuild'`, `'prettier'`, etc...)
	 */
	pkgCmd: string;
};

export type CommandScriptStruct = CommandStructBase & {
	/**
	 * The script (as present in package.json) the object is targeting
	 * (e.g. `'my-script'`, `'build'`, `'test'`, etc...)
	 */
	script: string;
};
