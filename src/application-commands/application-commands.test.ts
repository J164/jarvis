import { readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { type ApplicationCommandHandler } from '../util/load-commands.js';
import { APPLICATION_COMMANDS } from '../../deploy/application-commands.js';

const files = await readdir('./src/application-commands');

const commands = await Promise.all(
	files
		.filter((file) => {
			return !file.endsWith('test.ts');
		})
		.map(async (file) => {
			return ((await import(`../application-commands/${file}`)) as { handler: ApplicationCommandHandler }).handler;
		}),
);

const applicationCommandNames = new Set<string>();

describe.each(commands)('well-formedness of application command $name', ({ name }) => {
	it('should have a unique name', () => {
		expect(applicationCommandNames.has(name)).toBe(false);
		applicationCommandNames.add(name);
	});

	it('should match an application command in the deploy script', () => {
		expect(
			APPLICATION_COMMANDS.some(({ name: deployName }) => {
				return deployName === name;
			}),
		).toBe(true);
	});
});
