import { getNpmOrPnpmGetPackageInfoFunction } from './shared';

export function getPnpmGetPackageInfoFunction() {
	return getNpmOrPnpmGetPackageInfoFunction('pnpm');
}
