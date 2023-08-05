import { readdir } from "fs/promises";
import { cwd } from "process";

type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

type PackageManager = {
  name: PackageManagerName;
};

export async function getPackageManager(): Promise<PackageManager> {
  const dirFiles = await readdir(cwd());
  const dirContainsPackageJson = dirFiles.includes('package.json');

  if(dirContainsPackageJson && dirFiles.includes('package-lock.json')) {
    return {
      name: 'npm'
    };
  }

  if(dirContainsPackageJson && dirFiles.includes('yarn.lock')) {
    return {
      name: 'yarn'
    };
  }

  if(dirContainsPackageJson && dirFiles.includes('pnpm-lock.yaml')) {
    return {
      name: 'pnpm'
    };
  }

  if(dirContainsPackageJson && dirFiles.includes('bun.lockb')) {
    return {
      name: 'bun'
    };
  }

  throw new Error('no package manager detected');
};