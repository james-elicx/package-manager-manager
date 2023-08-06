import mockFs from 'mock-fs';
import { getPackageManager } from 'src/packageManager';
import { suite, test, expect, beforeEach, afterEach, vi } from 'vitest';

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
		default: (
			commandLiteral: TemplateStringsArray,
			...literalArgs: string[]
		) => Promise<{ stdout: string; stderr: string }>;
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

		async default(
			commandLiteral: TemplateStringsArray,
			...literalArgs: string[]
		): Promise<{ stdout: string; stderr: string }> {
			const command = literalArgs.reduce((finalString, value, index) => {
				return `${finalString}${value}${commandLiteral[index + 1]}`;
			}, commandLiteral[0]);

			const mockResult = handlersMap.get(command ?? '');

			return mockResult ?? { stdout: '', stderr: '' };
		},
	};

	globalThis.shellacMock = shellacMock;

	return shellacMock;
});

suite.only('PackageManager version', () => {
	const { shellacMock } = globalThis;

	beforeEach(() => {
		shellacMock.resetMocks();
	});

	afterEach(() => mockFs.restore());

	test.only('npm detection', async () => {
		mockFs({
			'package.json': '',
			'package-lock.json': '',
		});
		shellacMock.addMock('$ npm --version', '16.16.0');
		const packageManager = await getPackageManager();
		expect(packageManager?.version).toEqual('16.16.0');
	});

	test('yarn detection', async () => {
		mockFs({
			'package.json': '',
			'yarn.lock': '',
		});
		shellacMock.addMock('$ yarn --version', '1.22.0');
		const packageManager = await getPackageManager();
		expect(packageManager?.version).toEqual('1.22.0');
	});

	test('pnpm detection', async () => {
		mockFs({
			'package.json': '',
			'pnpm-lock.yaml': '',
		});
		shellacMock.addMock('$ pnpm --version', '7.27.0');
		const packageManager = await getPackageManager();
		expect(packageManager?.version).toEqual('7.27.0');
	});

	test('bun detection', async () => {
		mockFs({
			'package.json': '',
			'bun.lockb': '',
		});
		shellacMock.addMock('$ bun --version', '0.7.3');
		const packageManager = await getPackageManager();
		expect(packageManager?.version).toEqual('0.7.3');
	});
});
