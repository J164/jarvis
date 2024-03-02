import { readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { validate } from 'node-cron';
import { type Task } from '../bot-client.js';

const files = await readdir('./src/tasks');

const tasks = await Promise.all(
	files
		.filter((file) => {
			return !file.endsWith('test.ts');
		})
		.map(async (file) => {
			return ((await import(`../tasks/${file}`)) as { task: Task }).task;
		}),
);

const taskNames = new Set<string>();

describe.each(tasks)('well-formedness of task $scheduleOptions.name', ({ cronExpression, scheduleOptions: { name } }) => {
	it('should have a valid cron expression', () => {
		expect(validate(cronExpression)).toBe(true);
	});

	it('should have a unique name', () => {
		expect(taskNames.has(name)).toBe(false);
		taskNames.add(name);
	});
});
