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
> Note that this library comes with properly defined and documented typescript types, meaning that once you obtain the `PackageManager` object you will be able to easily see what's available on it and get all necessary details directly in your IDE
