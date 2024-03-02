import { type CacheType, type ChatInputCommandInteraction, type Interaction } from 'discord.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';
import { type CommandContext, type ApplicationCommandHandlers, type BotClient, type ChatInputCommand } from '../bot-client.js';

export async function onInteractionCreate(this: BotClient, handlers: ApplicationCommandHandlers, interaction: Interaction): Promise<void> {
	if (interaction.isChatInputCommand()) {
		await handleChatInputCommand(interaction, this, handlers);
	}
}

async function handleChatInputCommand(interaction: ChatInputCommandInteraction, client: BotClient, handlers: ApplicationCommandHandlers): Promise<void> {
	const handler = handlers[interaction.commandName];

	if (!handler || handler.type !== 'chatInputCommand') {
		client.globalLogger.error(`Could not find handler for Chat Input Command named "${interaction.commandName}"`);
		await interaction.reply(responseOptions(EmbedType.Error, 'Something went wrong!'));
		return;
	}

	const interactionResponse = (await interaction.deferReply({ ephemeral: handler.ephemeral ?? false })) as ChatInputCommand<CacheType>;

	const commandLogger = client.globalLogger.child({
		type: 'chat-input-command',
		id: interaction.id,
		commandName: interaction.commandName,
		options: interaction.options,
	});

	const context: CommandContext = { botClient: client, commandLogger };

	if (!handler.allowedInDm) {
		if (!interaction.inCachedGuild()) {
			await interaction.editReply(responseOptions(EmbedType.Error, 'This command can only be used in servers!'));
			return;
		}

		try {
			await handler.respond(interactionResponse as ChatInputCommand<'cached'>, context);
		} catch (error) {
			await interaction.editReply(responseOptions(EmbedType.Error, 'Something went wrong!'));
			commandLogger.error(error, 'Chat Input Command Interaction threw an error');
		}

		return;
	}

	try {
		await handler.respond(interactionResponse, context);
	} catch (error) {
		await interaction.editReply(responseOptions(EmbedType.Error, 'Something went wrong!'));
		commandLogger.error(error, 'Chat Input Command Interaction threw an error');
	}
}
