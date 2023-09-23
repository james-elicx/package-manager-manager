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

To use the library first install it in your project, via:

```sh
npm i package-manager-manager
```

(or your package manager's equivalent)

Then simply import and use the `getPackageManager()` function to get an object containing all the information you need regarding the package manager currently being used:

```js
const packageManager = await getPackageManager();

console.log(packageManager.name);
// logs 'npm', 'yarn', 'pnpm' or 'bun'

console.log(packageManager.version);
// logs the version of the package manager e.g. '8.11.0'
```

> **Note**
> This library comes with properly defined and documented typescript types, meaning that once you obtain the `PackageManager` object you will be able to easily see what's available on it and get all necessary details directly in your IDE

### API

### getPackageInfo

`packageManager.getPackageInfo` allows you to get the information regarding a locally installed package that your client application is using, it can for example be used to make sure your user's application has a certain dependency or to gather and display the package version of such dependency.

#### Example

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

### getRunScript

`packageManager.getRunScript` let's you create a command that can be used to run a script defined in the package.json file.

> For more advanced use cases you can use `packageManager.getRunScriptStruct` to obtain an object representing the command and extract whatever information you need from that

#### Example

```js
const runBuildCommand = packageManager.getRunScript('build', {
	args: ['./dist', '--verbose'],
});

console.log(`To build your application run: ${runBuildCommand}`);
```

### getRunExec

`packageManager.getRunExec` let's you create a command that can be used to execute a command from a target package (which may or may not be locally installed).

> For more advanced use cases you can use `packageManager.getRunExecStruct` to obtain an object representing the command and extract whatever information you need from that

#### Example

```js
const eslintCommand = packageManager.getRunExec('eslint', {
	args: ['./src', '--quiet'],
});

console.log(`To run eslint on your application run: ${runBuildCommand}`);
```
