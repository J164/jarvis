import { EmbedType, responseOptions } from '../util/response-helpers.js';
import { type Task } from '../util/schedule-tasks.js';

export const task: Task = {
	cronExpression: '0 15 * * 4',
	scheduleOptions: { name: 'free-weekly-game' },
	async handler(target) {
		const dm = await target.createDM();

		await dm.send(responseOptions(EmbedType.Info, "Don't forget to claim the free game of the week! (https://store.epicgames.com/en-US/)"));
	},
};
