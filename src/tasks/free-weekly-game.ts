import { env } from 'node:process';
import { type Task } from '../bot-client.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';

export const task: Task = {
	cronExpression: '0 15 * * 4',
	scheduleOptions: { name: 'free-weekly-game' },
	async handler(context) {
		const user = await context.botClient.client.users.fetch(env.USER_ID ?? '');
		const dm = await user.createDM();

		await dm.send(responseOptions(EmbedType.Info, "Don't forget to claim the free game of the week! (https://store.epicgames.com/en-US/)"));
	},
};
