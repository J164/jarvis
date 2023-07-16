import { readdir } from 'node:fs/promises';
import { type ScheduleOptions, schedule, type ScheduledTask } from 'node-cron';
import { type User } from 'discord.js';

type HandlerContext = { target: User; task: ScheduledTask };

export type Task = {
	readonly cronExpression: string;
	readonly handler: (this: HandlerContext) => void;
	readonly scheduleOptions: ScheduleOptions & { name: string };
};

export async function scheduleTasks(target: User): Promise<void> {
	const tasks = await readdir('./tasks');

	await Promise.all(
		tasks.map(async (file) => {
			const {
				task: { cronExpression, handler, scheduleOptions },
			} = (await import(`../tasks/${file}`)) as { task: Task };

			const info: { target: User; task?: ScheduledTask } = { target };

			info.task = schedule(cronExpression, handler.bind(info as HandlerContext), scheduleOptions);
		}),
	);
}
