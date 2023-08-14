import { type ChatInputCommandHandler, sendPaginatedMessage, DestinationType, responseEmbed, EmbedType } from '@j164/bot-framework';
import { getTasks } from 'node-cron';

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
