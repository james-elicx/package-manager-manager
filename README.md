<p align="center">
  <h3 align="center">package-manager-manager</h3>

  <p align="center">
    Utilities for managing package managers.
  </p>
</p>

---

<p align="center">
  <a href="https://npmjs.com/package/package-manager-manager" target="_blank">
		<img alt="npm (tag)" src="https://img.shields.io/npm/v/package-manager-manager/latest?color=3777FF&style=flat-square" />
	</a>
	<img alt="GitHub Workflow Status (with branch)" src="https://img.shields.io/github/actions/workflow/status/james-elicx/package-manager-manager/release.yml?branch=main&color=95FF38&style=flat-square" />
</p>

---

**package-manager-manager** is a library aimed at providing information regarding the package manager currently being used in a given project.

It can be used in CLIs or similar projects which may at some point need to know and adapt their behavior based on the package manager currently used by the developer (e.g. A project scaffolding tool, a bundling tool, etc...).

## Usage

### Install

To use the library first install it in your project, via:

```sh
npm i package-manager-manager
```

(or your package manager's equivalent)

### PackageManager API

The main API of the library is based on a `PackageManager` which you simply can get a hold of by importing and calling the `getPackageManager()` function.

Once you have a `PackageManager` object its API should be easily explorable via your IDE intellisense (thanks to the fact that this library comes with properly defined and documented typescript types).

#### Example
```js
const packageManager = await getPackageManager();

console.log(packageManager.name);
// logs 'npm', 'yarn', 'pnpm' or 'bun'

console.log(packageManager.version);
// logs the version of the package manager e.g. '8.11.0'
```

Let's see some of the primary methods exposed by a `PackageManager` object:

#### getPackageInfo

`packageManager.getPackageInfo` allows you to get the information regarding a locally installed package that your client application is using, it can for example be used to make sure your user's application has a certain dependency or to gather and display the package version of such dependency.

For example:

```js
const zodPackage = await packageManager.getPackageInfo('zod');
if (zodPackage) {
	console.log(`starting validation using zod (version: ${zodPackage.version}`);
} else {
	throw new Error('Error: zod is not installed');
}
```

> **Note**
> This method only returns the information of a **locally installed package**, or _null_ in case the package is not installed, it does not return information of packages not locally installed (the API could be extended in the future to also include such use case)

#### getRunScript

`packageManager.getRunScript` let's you create a command that can be used to run a script defined in the package.json file.

For example:

```js
const buildStr = packageManager.getRunScript('build', {
	args: ['./dist', '--verbose'],
});

console.log(`To build your application run: ${buildStr}`);
```

If you need more fine grained control over the command you can use its `packageManager.getRunScriptStruct` alternative to obtain an object representing the command.

For example:

```js
import { spawn } from 'child_process';

const buildCmd = packageManager.getRunScriptStruct('build', {
	args: ['./dist', '--verbose'],
});

// run the command for the user
spawn(buildCmd.cmd, buildCmd.cmdArgs);
```

#### getRunExec

`packageManager.getRunExec` let's you create a command that can be used to execute a command from a target package (which may or may not be locally installed).

For example:

```js
const eslintStr = packageManager.getRunExec('eslint', {
	args: ['./src', '--quiet'],
});

console.log(`To run eslint on your application run: ${eslintStr}`);
```

If you need more fine grained control over the command you can use its `packageManager.getRunExecStruct` alternative to obtain an object representing the command.

For example:

```js
import { spawn } from 'child_process';

const eslintCmd = packageManager.getRunExec('eslint', {
	args: ['./src', '--quiet'],
});

// run the command for the user
spawn(eslintCmd.cmd, eslintCmd.cmdArgs);
```

### Short APIs

There are two methods that can be used to generate script and exec-like commands, these are equivalent to respectively `getRunScript` and `getRunExec` but don't require you to manually create a `PackageManager` object (that is done for you under the hood) and provide an API which makes you write code that resembles closer what you'd type in your terminal.

#### `npm_run`

`npm_run` is used to generate a script command, you use it by providing a string literal as its value, the content should be exactly the same as what you'd type in your terminal when using **npm run**, but without the `npm` and `run` keywords.

The function parses the provided string and generates its equivalent for the current package manager.

#### Example
```ts
 import { npm_run } from 'package-manager-manager';

 const myScriptRun = await npm_run` my-script -- --local`;
 console.log(myScriptRun);
 // based on what the current package manager is it prints:
 //  - `npm run my-script -- --local` for npm
 //  - `yarn my-script --local` for yarn
 //  - `pnpm my-script --local` for pnpm
 //  - `bun my-script --local` for bun
```

Note: you can also provide options to the `npm_run` function in the following way: `` npm_run.with(options)`...` ``


#### `npx`

`npx` is used to generate an exec-like command, you use it by providing a string literal as its value, the content should be exactly the same as what you'd type in your terminal when using **npx**, but without the `npx` keywords.

The function parses the provided string and generates its equivalent for the current package manager.

#### Example
```ts
 import { npx } from 'package-manager-manager';

 const myPackageCommandRun = await npx` eslint . --fix`;
 console.log(myPackageCommandRun);
 // based on what the current package manager is it prints:
 //  - `npx eslint . --fix` for npm
 //  - `yarn exec eslint . --fix` for yarn (classic)
 //  - `yarn dlx eslint . --fix` for yarn (berry)
 //  - `pnpm dlx eslint . --fix` for pnpm
 //  - `bunx eslint . --fix` for bun
```

Note: you can also provide options to the `npx` function in the following way: `` npx.with(options)`...` ``