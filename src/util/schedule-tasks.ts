import { readdir } from 'node:fs/promises';
import { type ScheduleOptions, schedule } from 'node-cron';
import { type User } from 'discord.js';

export type Task = {
	readonly cronExpression: string;
	readonly handler: (target: User) => void;
	readonly scheduleOptions: ScheduleOptions & { name: string };
};

export async function scheduleTasks(target: User): Promise<void> {
	const tasks = await readdir('./tasks');

	await Promise.all(
		tasks.map(async (file) => {
			const {
				task: { cronExpression, handler, scheduleOptions },
			} = (await import(`../tasks/${file}`)) as { task: Task };

			schedule(cronExpression, handler.bind(undefined, target), scheduleOptions);
		}),
	);
}
