import type { PackageManager } from 'src/packageManager';

export function isYarnClassic(packageManager: Pick<PackageManager, 'name' | 'version'>): boolean {
	return packageManager.name === 'yarn' && packageManager.version.startsWith('1.');
}
