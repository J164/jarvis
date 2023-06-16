import { readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { validate } from 'node-cron';
import { type Task } from '../util/schedule-tasks.js';

const files = await readdir('./tasks');

const tasks = await Promise.all(
	files.map(async (file) => {
		return ((await import(`../tasks/${file}`)) as { task: Task }).task;
	}),
);

describe.each(tasks)('well-formedness of task "$name"', ({ cronExpression }) => {
	it('should have a valid cron expression', () => {
		expect(validate(cronExpression)).toBe(true);
	});
});
