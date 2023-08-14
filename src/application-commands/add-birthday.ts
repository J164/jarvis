import { env } from 'node:process';
import { type ChatInputCommandHandler, EmbedType, responseOptions } from '@j164/bot-framework';
import { Int32 } from 'mongodb';
import { BIRTHDAY_COLLECTION } from '../util/collection-options.js';
import { type Birthday } from '../tasks/birthdays.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'add-birthday',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response, context) {
		const name = response.interaction.options.getString('name', true);
		const month = response.interaction.options.getInteger('month', true);
		const day = response.interaction.options.getInteger('day', true);

		const collection = await context.fetchCollection<Birthday>('birthdays', env.MONGO_URL ?? '', BIRTHDAY_COLLECTION);

		const req = await collection.findOne({ _name: name });

		if (req) {
			const date = req._date.toJSON();
			await response.interaction.editReply(
				responseOptions(EmbedType.Error, `There is already a user named "${req._name}" with birthday on ${Math.floor(date / 100) + 1}/${date % 100}`),
			);

			return;
		}

		await collection.insertOne({
			_name: name,
			_date: new Int32(month * 100 + day),
		});

		await response.interaction.editReply(responseOptions(EmbedType.Success, `Successfully added ${name}'s birthday on ${month + 1}/${day}`));
	},
};
