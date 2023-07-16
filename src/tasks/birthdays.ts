import { Int32, type Document } from 'mongodb';
import { type DMChannel } from 'discord.js';
import { type Task } from '../util/schedule-tasks.js';
import { EmbedType, responseEmbed } from '../util/response-helpers.js';
import { fetchCollection } from '../database/database.js';

export type Birthday = {
	_date: Int32;
	_name: string;
} & Document;

const WEEK = 1000 * 60 * 60 * 24 * 7;

export const task: Task = {
	cronExpression: '0 13 * * *',
	scheduleOptions: { name: 'birthdays' },
	async handler() {
		const dm = await this.target.createDM();

		await Promise.all([remindBirthdays(dm, 0), remindBirthdays(dm, 1), remindBirthdays(dm, 2)]);
	},
};

async function remindBirthdays(dm: DMChannel, offsetWeeks: number): Promise<void> {
	const time = offsetWeeks === 0 ? new Date() : new Date(Date.now() + offsetWeeks * WEEK);
	const month = time.getMonth();
	const date = time.getDate();

	const collection = await fetchCollection('birthdays');
	const cursor = collection.find({ _date: new Int32(month * 100 + date) });

	await dm.send({
		embeds: await cursor
			.map(({ _name }) => {
				return responseEmbed(EmbedType.Info, `${_name}'s birthday is ${offsetWeeks === 0 ? 'today' : `in ${offsetWeeks} weeks on ${month + 1}/${date}`}!`);
			})
			.toArray(),
	});
}
