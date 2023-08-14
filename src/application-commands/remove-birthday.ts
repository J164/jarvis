import { type ChatInputCommandHandler, responseOptions, sendPaginatedMessage, DestinationType, responseEmbed, EmbedType } from '@j164/bot-framework';
import { BIRTHDAY_COLLECTION } from '../util/collection-options.js';
import { type Birthday } from '../tasks/birthdays.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'remove-birthday',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response, context) {
		const collection = await context.botClient.fetchCollection<Birthday>('birthdays', BIRTHDAY_COLLECTION);
		const fields = await collection
			.find()
			.map(({ _name, _date }) => {
				const date = _date.toJSON();

				return {
					name: _name,
					value: `${Math.floor(date / 100)}/${Math.floor(date % 100)}`,
				};
			})
			.toArray();

		if (fields.length === 0) {
			await response.interaction.editReply(responseOptions(EmbedType.Error, 'There are no birthday reminders to remove'));
			return;
		}

		const req = await sendPaginatedMessage(
			{ type: DestinationType.InteractionEditReply, interaction: response.interaction },
			responseEmbed(EmbedType.Prompt, 'Select the birthday reminder to remove', { fields }),
			{ selectable: true },
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
