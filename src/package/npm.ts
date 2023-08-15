import { getNpmOrPnpmGetPackageInfoFunction } from './shared';

export function getNpmGetPackageInfoFunction() {
	return getNpmOrPnpmGetPackageInfoFunction('npm');
}
