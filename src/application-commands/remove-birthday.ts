import { fetchCollection } from '../database/database.js';
import { type ChatInputCommandHandler } from '../util/load-commands.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';

export const handler: ChatInputCommandHandler<true> = {
	name: 'remove-birthday',
	type: 'chatInputCommand',
	allowedInDm: true,
	async respond(response) {
		const name = response.interaction.options.getString('name', true);
		const collection = await fetchCollection('birthdays');

		const req = await collection.deleteOne({ _name: name });

		await response.interaction.editReply(
			req.deletedCount > 0
				? responseOptions(EmbedType.Success, `Successfully deleted birthday reminder for "${name}"`)
				: responseOptions(EmbedType.Info, `User "${name}" does not have a registered birthday`),
		);
	},
};

// TODO: set up autocomplete (need a local cache)
