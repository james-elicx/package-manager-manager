import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeAll, afterAll, suite } from 'vitest';

type WithFixturesOpts = { only?: string[]; skip?: string[] };
type Fn = (info: { fixture: string; fixturePath: string }) => void;

const originalDir = process.cwd();
const fixturesDir = resolve(originalDir, 'e2e', 'fixtures');

/**
 * Run a test suite for each fixture in the `e2e/fixtures` directory.
 *
 * @example All fixtures.
 * ```ts
 * withFixtures(({ fixture, fixturePath }) => {
 *   test(`fixture: ${fixture}`, () => { ... });
 * });
 * ```
 *
 * @example Only a specific subset of fixtures.
 * ```ts
 * withFixtures({ only: ['01-fixture'], ({ fixture, fixturePath }) => {
 *   test(`fixture: ${fixture}`, () => { ... });
 * });
 * ```
 *
 * @example All but a specific subset of fixtures.
 * ```ts
 * withFixtures({ skip: ['01-fixture'], ({ fixture, fixturePath }) => {
 *   test(`fixture: ${fixture}`, () => { ... });
 * });
 * ```
 *
 * @param opts Options for filtering fixtures.
 * @param fn The tests to run for each fixture.
 */
export const withFixtures = async (...args: [WithFixturesOpts, Fn] | [Fn]) => {
	const [{ only, skip }, fn] = args.length === 2 ? args : [{} satisfies WithFixturesOpts, args[0]];

	const fixtures = readdirSync(fixturesDir)
		.filter((fixture) => !skip?.includes(fixture))
		.filter((fixture) => (only ? only.includes(fixture) : true))
		.map((fixture) => ({ fixture, fixturePath: resolve(fixturesDir, fixture) }));

	fixtures.forEach(({ fixture, fixturePath }) => {
		suite(fixture, async () => {
			beforeAll(() => {
				process.chdir(fixturePath);
			});

			await Promise.resolve(fn({ fixture, fixturePath }));

			afterAll(() => {
				process.chdir(originalDir);
			});
		});
	});
};
