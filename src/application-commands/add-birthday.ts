import { type ChatInputCommandHandler } from '../util/load-commands.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'add-birthday',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response) {
		// TODO: implement
	},
};
