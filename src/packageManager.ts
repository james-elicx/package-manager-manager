import { getProjectRootDir } from "./utils";

type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

type PackageManager = {
  name: PackageManagerName;
};

export async function getPackageManager(): Promise<PackageManager> {
  const { files: projectRootFiles } = await getProjectRootDir();

  if(projectRootFiles.includes('package-lock.json')) {
    return {
      name: 'npm'
    };
  }

  if(projectRootFiles.includes('yarn.lock')) {
    return {
      name: 'yarn'
    };
  }

  if(projectRootFiles.includes('pnpm-lock.yaml')) {
    return {
      name: 'pnpm'
    };
  }

  if(projectRootFiles.includes('bun.lockb')) {
    return {
      name: 'bun'
    };
  }

  throw new Error('no package manager detected ' + projectRootFiles);
};