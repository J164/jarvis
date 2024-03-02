import { readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { APPLICATION_COMMANDS } from '../../deploy/application-commands.js';
import { type ApplicationCommandHandler } from '../bot-client.js';

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

describe.each(commands)('well-formedness of application command $name', (command) => {
	it('should have a unique name', () => {
		expect(applicationCommandNames.has(command.name)).toBe(false);
		applicationCommandNames.add(command.name);
	});

	it('should match an application command in the deploy script', () => {
		expect(
			APPLICATION_COMMANDS.some(({ name: deployName }) => {
				return deployName === command.name;
			}),
		).toBe(true);
	});

	it('should have an autocomplete function if autocomplete is enabled in the deploy script', () => {
		if (
			APPLICATION_COMMANDS.find(({ name: deployname }) => {
				return deployname === command.name;
			})?.options?.some((option) => {
				return option?.autocomplete;
			})
		) {
			expect(command.autocomplete).toBeDefined();
		}
	});
});
