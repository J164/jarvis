import { Int32 } from 'mongodb';
import { fetchCollection } from '../database/database.js';
import { type ChatInputCommandHandler } from '../util/load-commands.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'add-birthday',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response) {
		const name = response.interaction.options.getString('name', true);
		const month = response.interaction.options.getInteger('month', true);
		const day = response.interaction.options.getInteger('day', true);

		const collection = await fetchCollection('birthdays');

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
