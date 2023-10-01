---
'package-manager-manager': patch
---

in `pnpm`'s implementation of `getPackageInfo` don't use the json version of `pnpm list`
as that has proven not to be reliable
