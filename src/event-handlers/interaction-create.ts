import { type CacheType, type ChatInputCommandInteraction, type Interaction } from 'discord.js';
import { type ChatInputCommand, loadApplicationCommands } from '../util/load-commands.js';
import { globalLogger } from '../util/logger.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';

const logger = globalLogger.child({
	name: 'interaction-create-event',
});

const commands = await loadApplicationCommands();

export async function onInteractionCreate(interaction: Interaction): Promise<void> {
	if (interaction.isChatInputCommand()) {
		await handleChatInputCommand(interaction);
	}
}

async function handleChatInputCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	const command = commands[interaction.commandName];

	if (!command || command.type !== 'chatInputCommand') {
		logger.error(`Could not find handler for Chat Input Command named "${interaction.commandName}"`);
		await interaction.reply(responseOptions(EmbedType.Error, 'Something went wrong!'));
		return;
	}

	const interactionResponse = (await interaction.deferReply({ ephemeral: command.ephemeral ?? false })) as ChatInputCommand<CacheType>;

	const interactionLogger = logger.child({
		type: 'chat-input-command',
		id: interaction.id,
		commandName: interaction.commandName,
		options: interaction.options,
	});

	if (!command.allowedInDm) {
		if (!interaction.inCachedGuild()) {
			await interaction.editReply(responseOptions(EmbedType.Error, 'This command can only be used in servers!'));
			return;
		}

		try {
			await command.respond(interactionResponse as ChatInputCommand<'cached'>, interactionLogger);
		} catch (error) {
			await interaction.editReply(responseOptions(EmbedType.Error, 'Something went wrong!'));
			interactionLogger.error(error, 'Chat Input Command Interaction threw an error');
		}

		return;
	}

	try {
		await command.respond(interactionResponse, interactionLogger);
	} catch (error) {
		await interaction.editReply(responseOptions(EmbedType.Error, 'Something went wrong!'));
		interactionLogger.error(error, 'Chat Input Command Interaction threw an error');
	}
}
