import mockFs from 'mock-fs';
import { suite, test, expect, afterEach } from 'vitest';
import { getPackageManager } from '../src/packageManager';

suite('PackageManager', () => {
	afterEach(() => mockFs.restore());

	test('null is returned in case no package manager could be detected (because no lock file could be detected)', async () => {
		mockFs({
			'package.json': '',
		});
		const packageManager = await getPackageManager();
		expect(packageManager).toBeNull();
	});
});
