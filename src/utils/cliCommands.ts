import type { PackageManager, PackageManagerMetadata } from '../packageManager';

// source: https://docs.npmjs.com/cli/v10/commands?v=true
const npmCliCommandKeywords = [
	'access',
	'adduser',
	'audit',
	'bugs',
	'cache',
	'ci',
	'completion',
	'config',
	'dedupe',
	'deprecate',
	'diff',
	'dist-tag',
	'docs',
	'doctor',
	'edit',
	'exec',
	'explain',
	'explore',
	'find-dupes',
	'fund',
	'help',
	'help-search',
	'hook',
	'init',
	'install',
	'install-ci-test',
	'install-test',
	'link',
	'login',
	'logout',
	'ls',
	'org',
	'outdated',
	'owner',
	'pack',
	'ping',
	'pkg',
	'prefix',
	'profile',
	'prune',
	'publish',
	'query',
	'rebuild',
	'repo',
	'restart',
	'root',
	'run',
	'run-script',
	'search',
	'shrinkwrap',
	'star',
	'stars',
	'start',
	'stop',
	'team',
	'test',
	'token',
	'uninstall',
	'unpublish',
	'unstar',
	'update',
	'version',
	'view',
	'whoami',
];

// source: https://classic.yarnpkg.com/lang/en/docs/cli/
const yarnClassicCliCommandKeywords = [
	'add',
	'audit',
	'autoclean',
	'bin',
	'cache',
	'check',
	'config',
	'create',
	'dedupe',
	'generate-lock-entry',
	'global',
	'help',
	'import',
	'info',
	'init',
	'install',
	'licenses',
	'link',
	'list',
	'lockfile',
	'login',
	'logout',
	'outdated',
	'owner',
	'pack',
	'policies',
	'prune',
	'publish',
	'remove',
	'run',
	'self-update',
	'tag',
	'team',
	'test',
	'unlink',
	'upgrade',
	'upgrade-interactive',
	'version',
	'versions',
	'why',
	'workspace',
	'workspaces',
];

// source: https://yarnpkg.com/cli
const yarnBerryCliCommandKeywords = [
	'add',
	'bin',
	'cache',
	'config',
	'config',
	'dedupe',
	'dlx',
	'exec',
	'explain',
	'info',
	'init',
	'install',
	'link',
	'node',
	'npm',
	'pack',
	'patch',
	'patch-commit',
	'rebuild',
	'remove',
	'run',
	'set',
	'stage',
	'unlink',
	'unplug',
	'up',
	'why',
];

// source: https://pnpm.io/pnpm-cli
const pnpmCliCommandKeywords = [
	'add',
	'audit',
	'bin',
	'config',
	'create',
	'dedupe',
	'deploy',
	'dlx',
	'doctor',
	'env',
	'exec',
	'fetch',
	'import',
	'init',
	'install',
	'install-test',
	'licenses',
	'link',
	'list',
	'outdated',
	'pack',
	'patch',
	'patch-commit',
	'patch-remove',
	'prune',
	'publish',
	'rebuild',
	'remove',
	'root',
	'run',
	'server',
	'setup',
	'start',
	'store',
	'test',
	'unlink',
	'update',
	'why',
];

// source: https://bun.sh/docs
const bunCliCommandKeywords = ['add', 'install', 'link', 'pm', 'remove', 'run', 'test', 'x'];

/**
 * Gets the set of all CLI command keywords available for the provided package manager
 *
 * Note: only uses the package manager's version to discern between yarn classic and berry, it does
 *       not take versions into consideration for the other package managers, considering the versions
 *       for them would increase the complexity of this solution, so for now let's just discern by package
 *       manager names only, if this turns out not to be sufficient later on we can take versions into
 *       consideration as well
 *
 * @param packageManager package manager to check
 * @returns the set of keywords
 */
export function getPmCliCommandKeywords(
	packageManager: Pick<PackageManager, 'name' | 'version'> & {
		metadata: Pick<PackageManagerMetadata, 'isYarnClassic'>;
	},
): Readonly<Set<string>> {
	let keywords: string[] = [];

	if (packageManager.name !== 'yarn') {
		keywords = {
			npm: npmCliCommandKeywords,
			pnpm: pnpmCliCommandKeywords,
			bun: bunCliCommandKeywords,
		}[packageManager.name];
	} else {
		keywords = packageManager.metadata.isYarnClassic
			? yarnClassicCliCommandKeywords
			: yarnBerryCliCommandKeywords;
	}

	return new Set(keywords);
}
