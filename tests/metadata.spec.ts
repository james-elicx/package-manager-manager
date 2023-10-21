import mockFs from 'mock-fs';
import { suite, test, expect, beforeEach, afterEach, vi, describe } from 'vitest';
import { getPackageManager } from '../src/packageManager';

type ShellacMock = {
	addMock: (command: string, result: string | { stdout: string; stderr: string }) => void;
	resetMocks: () => void;
};

declare global {
	// eslint-disable-next-line vars-on-top, no-var
	var shellacMock: ShellacMock;
}

vi.mock('shellac', () => {
	const handlersMap = new Map<string, { stdout: string; stderr: string }>();

	const shellacMock: ShellacMock & {
		default: {
			env: () => (
				commandLiteral: TemplateStringsArray,
				...literalArgs: string[]
			) => Promise<{ stdout: string; stderr: string }>;
		};
	} = {
		addMock(command: string, result: string | { stdout: string; stderr: string }): void {
			handlersMap.set(
				command,
				typeof result === 'string' ? { stdout: result, stderr: '' } : result,
			);
		},
		resetMocks() {
			handlersMap.clear();
		},

		default: {
			env() {
				return async (
					commandLiteral: TemplateStringsArray,
					...literalArgs: string[]
				): Promise<{ stdout: string; stderr: string }> => {
					const command = literalArgs.reduce((acc, value, index) => {
						return `${acc}${value}${commandLiteral[index + 1]}`;
					}, commandLiteral[0]);

					const mockResult = handlersMap.get(command ?? '');

					return mockResult ?? { stdout: '', stderr: '' };
				};
			},
		},
	};

	globalThis.shellacMock = shellacMock;

	return shellacMock;
});

suite('PackageManager metadata', () => {
	const { shellacMock } = globalThis;

	describe('isYarnClassic and isYarnBerry', () => {
		beforeEach(() => {
			shellacMock.resetMocks();
		});

		afterEach(() => mockFs.restore());

		test('npm', async () => {
			process.env['npm_config_user_agent'] = 'npm/v node/v linux';
			const packageManager = await getPackageManager();
			expect(packageManager?.metadata.isYarnClassic).toBe(false);
			expect(packageManager?.metadata.isYarnBerry).toBe(false);
		});

		test('yarn classic', async () => {
			process.env['npm_config_user_agent'] = 'yarn/v node/v linux';
			shellacMock.addMock('$ yarn --version', '1.22.0');
			const packageManager = await getPackageManager();
			expect(packageManager?.metadata.isYarnClassic).toBe(true);
			expect(packageManager?.metadata.isYarnBerry).toBe(false);
		});

		test('yarn berry', async () => {
			process.env['npm_config_user_agent'] = 'yarn/v node/v linux';
			shellacMock.addMock('$ yarn --version', '3.0.0');
			const packageManager = await getPackageManager();
			expect(packageManager?.metadata.isYarnClassic).toBe(false);
			expect(packageManager?.metadata.isYarnBerry).toBe(true);
		});

		test('pnpm', async () => {
			process.env['npm_config_user_agent'] = 'pnpm/v node/v linux';
			const packageManager = await getPackageManager();
			expect(packageManager?.metadata.isYarnClassic).toBe(false);
			expect(packageManager?.metadata.isYarnBerry).toBe(false);
		});

		test('bun', async () => {
			process.env['npm_config_user_agent'] = 'bun/v node/v linux';
			const packageManager = await getPackageManager();
			expect(packageManager?.metadata.isYarnClassic).toBe(false);
			expect(packageManager?.metadata.isYarnBerry).toBe(false);
		});
	});
});
