import { describe, expect, it } from 'vitest';
import { APPLICATION_COMMANDS } from './application-commands.js';

const applicationCommandNames = new Set<string>();

describe.each(APPLICATION_COMMANDS)('well-formedness of application command $name', ({ name }) => {
	it.todo('should have a valid name');

	it.todo('should have a valid description');

	it('should have a unique name', () => {
		expect(applicationCommandNames.has(name)).toBe(false);
		applicationCommandNames.add(name);
	});
});
