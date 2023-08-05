import { getPackageManager } from 'src/packageManager';
import { suite, test, expect, describe, afterEach } from 'vitest';
import mockFs from 'mock-fs';

suite('PackageManager name', () => {
  afterEach(() => mockFs.restore());

  test('error in case no package manager could be detected', async () => {
    mockFs({
      'package.json': '',
    });
    expect(() => getPackageManager()).rejects.toThrowError('no package manager detected');
  });

  describe('in a standard setup (without workspaces / no monorepos)', () => {
    afterEach(() => mockFs.restore());

    test('npm detection', async () => {
      mockFs({
        'package.json': '',
        'package-lock.json': '',
      });
      const packageManager = await getPackageManager();
      expect(packageManager.name).toEqual('npm');
    });

    test('yarn detection', async () => {
      mockFs({
        'package.json': '',
        'yarn.lock': '',
      });
      const packageManager = await getPackageManager();
      expect(packageManager.name).toEqual('yarn');
    });

    test('pnpm detection', async () => {
      mockFs({
        'package.json': '',
        'pnpm-lock.yaml': '',
      });
      const packageManager = await getPackageManager();
      expect(packageManager.name).toEqual('pnpm');
    });

    test('bun detection', async () => {
      mockFs({
        'package.json': '',
        'bun.lockb': '',
      });
      const packageManager = await getPackageManager();
      expect(packageManager.name).toEqual('bun');
    });
  });
});
