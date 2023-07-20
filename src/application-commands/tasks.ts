import { getTasks } from 'node-cron';
import { type ChatInputCommandHandler } from '../util/load-commands.js';
import { DestinationType, sendPaginatedMessage } from '../util/message-component-helpers.js';
import { EmbedType, responseEmbed } from '../util/response-helpers.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'tasks',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response) {
		await sendPaginatedMessage(
			{ type: DestinationType.InteractionEditReply, interaction: response.interaction },
			responseEmbed(EmbedType.Info, 'Scheduled Tasks', {
				fields: [...getTasks().keys()].map((task, index) => {
					return { name: `${index + 1}.`, value: task };
				}),
			}),
		);
	},
};
