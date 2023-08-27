import type { PackageManager } from '../packageManager';

export function isYarnClassic(packageManager: Pick<PackageManager, 'name' | 'version'>): boolean {
	return packageManager.name === 'yarn' && packageManager.version.startsWith('1.');
}
