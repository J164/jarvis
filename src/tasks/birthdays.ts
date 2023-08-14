import { env } from 'node:process';
import { Int32, type Document, type Collection } from 'mongodb';
import { type DMChannel } from 'discord.js';
import { EmbedType, type Task, responseEmbed } from '@j164/bot-framework';
import { BIRTHDAY_COLLECTION } from '../util/collection-options.js';

export type Birthday = {
	_date: Int32;
	_name: string;
} & Document;

const WEEK = 1000 * 60 * 60 * 24 * 7;

export const task: Task = {
	cronExpression: '0 13 * * *',
	scheduleOptions: { name: 'birthdays' },
	async handler(context) {
		const user = await context.botClient.client.users.fetch(env.USER_ID ?? '');
		const dm = await user.createDM();
		const collection = await context.botClient.fetchCollection<Birthday>('birthdays', BIRTHDAY_COLLECTION);

		await Promise.all([remindBirthdays(dm, collection, 0), remindBirthdays(dm, collection, 1), remindBirthdays(dm, collection, 2)]);
	},
};

async function remindBirthdays(dm: DMChannel, collection: Collection<Birthday>, offsetWeeks: number): Promise<void> {
	const time = offsetWeeks === 0 ? new Date() : new Date(Date.now() + offsetWeeks * WEEK);
	const month = time.getMonth();
	const date = time.getDate();

	const cursor = collection.find({ _date: new Int32(month * 100 + date) });

	await dm.send({
		embeds: await cursor
			.map(({ _name }) => {
				return responseEmbed(EmbedType.Info, `${_name}'s birthday is ${offsetWeeks === 0 ? 'today' : `in ${offsetWeeks} weeks on ${month + 1}/${date}`}!`);
			})
			.toArray(),
	});
}
