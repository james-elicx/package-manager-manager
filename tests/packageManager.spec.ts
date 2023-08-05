import { getPackageManager } from 'src/packageManager';
import { suite, test, expect, afterEach } from 'vitest';
import mockFs from 'mock-fs';

suite('PackageManager name', () => {
  afterEach(() => mockFs.restore());

  test('error in case no package manager could be detected (because no lock file could be detected)', async () => {
    mockFs({
      'package.json': '',
    });
    expect(() => getPackageManager()).rejects.toThrowError('no package manager detected');
  });
});
