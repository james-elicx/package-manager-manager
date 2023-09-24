# package-manager-manager

## 0.1.0

### Minor Changes

- b8d9033: add version detection
- e2bad7c: add flag to CommandStructs to indicate whether double dashes need to prepend the command's arguments
- ed506ff: add getPackageInfo method to packageManager object
- 43fa7c1: introduce basic package manager detection (both in standard and monorepos/workspaces)
- e5622c1: add `getRunScript` and `getRunScriptStruct` to the `PackageManager` object

### Patch Changes

- 3729595: fix `getPackageInfoFunction` returning info for non installed packages for yarn
- 1f2f2a2: change CommandStructBase structure
- 5141dc4: improve library usage and typings
