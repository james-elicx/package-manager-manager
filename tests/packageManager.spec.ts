import mockFs from 'mock-fs';
import { getPackageManager } from 'src/packageManager';
import { suite, test, expect, afterEach } from 'vitest';

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
