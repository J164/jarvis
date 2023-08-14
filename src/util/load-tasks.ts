import { readdir } from 'node:fs/promises';
import { type Task } from '@j164/bot-framework';

export async function loadTasks(): Promise<Task[]> {
	const tasks = await readdir('./tasks');

	return Promise.all(
		tasks.map(async (file) => {
			const { task } = (await import(`../tasks/${file}`)) as { task: Task };
			return task;
		}),
	);
}
