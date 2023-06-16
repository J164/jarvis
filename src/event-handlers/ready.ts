import { readdir } from 'node:fs/promises';
import { type ScheduleOptions, schedule } from 'node-cron';
import { globalLogger } from '../util/logger.js';

const logger = globalLogger.child({
	name: 'ready-event',
});

type Task = {
	cronExpression: string;
	handler: () => void;
	scheduleOptions?: ScheduleOptions;
};

export async function onReady(): Promise<void> {
	logger.info('Login success!');

	const tasks = await readdir('./tasks');

	await Promise.all(
		tasks.map(async (file) => {
			const {
				task: { cronExpression, handler, scheduleOptions },
			} = (await import(`../tasks/${file}`)) as { task: Task };

			schedule(cronExpression, handler, scheduleOptions);
		}),
	);
}
