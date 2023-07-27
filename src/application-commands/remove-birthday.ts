import { fetchCollection } from '../database/database.js';
import { type ChatInputCommandHandler } from '../util/load-commands.js';
import { DestinationType, sendPaginatedMessage } from '../util/message-component-helpers.js';
import { EmbedType, responseEmbed, responseOptions } from '../util/response-helpers.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'remove-birthday',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response) {
		const collection = await fetchCollection('birthdays');

		const req = await sendPaginatedMessage(
			{ type: DestinationType.InteractionEditReply, interaction: response.interaction },
			responseEmbed(EmbedType.Prompt, 'Which birthday reminder would you like to remove?', {
				fields: await collection
					.find()
					.map(({ _name, _date }) => {
						const date = _date.toJSON();

						return {
							name: _name,
							value: `${Math.floor(date / 100)}/${Math.floor(date % 100)}`,
						};
					})
					.toArray(),
			}),
		);

		if (!req) return;

		await Promise.all(
			req.map(async (birthday) => {
				return collection.deleteOne({ _name: birthday });
			}),
		);

		await response.interaction.editReply(responseOptions(EmbedType.Success, 'Birthday reminders successfully removed!'));
	},
};