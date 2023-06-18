import { readdir } from 'node:fs/promises';
import { type ScheduleOptions, schedule } from 'node-cron';

export type Task = {
	readonly name: string;
	readonly cronExpression: string;
	readonly handler: () => void;
	readonly scheduleOptions?: ScheduleOptions;
};

export async function scheduleTasks(): Promise<void> {
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
