import { getTasks } from 'node-cron';
import { type ChatInputCommandHandler } from '../bot-client.js';
import { sendPaginatedMessage } from '../util/message-component-helpers.js';
import { EmbedType, responseEmbed } from '../util/response-helpers.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'tasks',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response) {
		await sendPaginatedMessage(
			async (options) => {
				return response.interaction.editReply(options);
			},
			responseEmbed(EmbedType.Info, 'Scheduled Tasks', {
				fields: [...getTasks().keys()].map((task, index) => {
					return { name: `${index + 1}.`, value: task };
				}),
			}),
		);
	},
};
