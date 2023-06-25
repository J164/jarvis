import {
	type Message,
	type APIEmbed,
	type BaseMessageOptions,
	type APIEmbedField,
	type TextBasedChannel,
	type ChatInputCommandInteraction,
	ComponentType,
	ButtonStyle,
} from 'discord.js';
import { globalLogger } from './logger.js';

/** Enum of embed format types */
export const enum EmbedType {
	Info,
	Error,
	Success,
	Prompt,
	None,
}

/** Enum of Discord emojis */
export const enum Emojis {
	Document = '\uD83D\uDCC4',
	RedX = '\u274C',
	GreenCheckMark = '\u2705',
	QuestionMark = '\u2753',
	DoubleArrowLeft = '\u23EA',
	ArrowLeft = '\u2B05\uFE0F',
	ArrowRight = '\u27A1\uFE0F',
	DoubleArrowRight = '\u23E9',
}

/** Enum of colors */
export const enum BotColors {
	DefaultBlue = 0x00_99_ff,
	ErrorRed = 0xff_00_00,
	SuccessGreen = 0x00_ff_00,
	QuestionOrange = 0xff_a5_00,
}

const logger = globalLogger.child({
	name: 'response-helpoers',
});

/**
 * Creates an embed based on its type
 * @param type Which type of formatting to use
 * @param title Optional title of the embed
 * @param options The embed to be formated
 * @returns The formated embed
 */
export function responseEmbed(type: EmbedType, title: string, options?: Omit<APIEmbed, 'title'>): APIEmbed {
	const embed: APIEmbed = options ?? {};

	switch (type) {
		case EmbedType.Info: {
			embed.color ??= BotColors.DefaultBlue;
			embed.title = `${Emojis.Document}\t${title}`;
			break;
		}

		case EmbedType.Error: {
			embed.color ??= BotColors.ErrorRed;
			embed.title = `${Emojis.RedX}\t${title}`;
			break;
		}

		case EmbedType.Success: {
			embed.color ??= BotColors.SuccessGreen;
			embed.title = `${Emojis.GreenCheckMark}\t${title}`;
			break;
		}

		case EmbedType.Prompt: {
			embed.color ??= BotColors.QuestionOrange;
			embed.title = `${Emojis.QuestionMark}\t${title}`;
			break;
		}

		default: {
			embed.title = title;
			break;
		}
	}

	return embed;
}

/**
 * Creates an embed based on its type and wraps it as a message
 * @param type Which type of formatting to use
 * @param title Optional title of the embed
 * @param options The embed to be formated
 * @returns The formated embed wrapped as a message
 */
export function responseOptions(type: EmbedType, title: string, options?: APIEmbed): BaseMessageOptions {
	return { embeds: [responseEmbed(type, title, options)] };
}

const enum Destinations {
	InteractionEditReply,
	TextChannelSend,
}

type Destination =
	| { type: Destinations.InteractionEditReply; interaction: ChatInputCommandInteraction }
	| { type: Destinations.TextChannelSend; channel: TextBasedChannel };

type PaginatedMessageOptions = BaseMessageOptions & {
	embeds: NonNullable<BaseMessageOptions['embeds']>;
	/** TODO: assert that the last component is a pagination component */
	components: NonNullable<BaseMessageOptions['components']>[0];
};

export async function sendPaginatedMessage(destination: Destination, embed: APIEmbed, options: BaseMessageOptions): Promise<void> {
	options.embeds ??= [];
	options.embeds.push(embed);

	const { fields } = embed;

	if (!fields || fields.length <= 25) {
		await sendMessage(destination, options);
		return;
	}

	embed.fields = fields.slice(0, 24) ?? [];

	options.components ??= [];
	options.components.push({
		type: ComponentType.ActionRow,
		components: [
			{
				type: ComponentType.Button,
				custom_id: 'page_first',
				style: ButtonStyle.Secondary,
				label: 'Beginning',
				emoji: { name: Emojis.DoubleArrowLeft },
				disabled: false,
			},
			{
				type: ComponentType.Button,
				custom_id: 'page_back',
				style: ButtonStyle.Secondary,
				label: 'Previous',
				emoji: { name: Emojis.ArrowLeft },
				disabled: false,
			},
			{
				type: ComponentType.Button,
				custom_id: 'page_close',
				style: ButtonStyle.Danger,
				label: 'Close',
				emoji: { name: Emojis.RedX },
				disabled: false,
			},
			{
				type: ComponentType.Button,
				custom_id: 'page_next',
				style: ButtonStyle.Secondary,
				label: 'Next',
				emoji: { name: Emojis.ArrowRight },
				disabled: false,
			},
			{
				type: ComponentType.Button,
				custom_id: 'page_last',
				style: ButtonStyle.Secondary,
				label: 'End',
				emoji: { name: Emojis.DoubleArrowRight },
				disabled: true,
			},
		],
	});

	const message = await sendMessage(destination, options);
	startPagination(destination, message, options as PaginatedMessageOptions, fields).catch((error) => {
		logger.error(error, 'Error thrown when handling pagination');
	});
}

async function startPagination(destination: Destination, message: Message, options: PaginatedMessageOptions, fields: APIEmbedField[]): Promise<void> {
	let index = 0;

	while (message.editable) {
		// eslint-disable-next-line no-await-in-loop
		const interaction = await getComponentInteraction(message, {
			componentType: ComponentType.Button,
			idle: 300_000,
			filter(interaction) {
				return interaction.customId.startsWith('page_');
			},
		});

		if (!interaction) return;

		switch (interaction.customId) {
			case 'page_first': {
				index = 0;
				break;
			}

			case 'page_back': {
				index--;
				break;
			}

			case 'page_close': {
				return;
			}

			case 'page_next': {
				index++;
				break;
			}

			case 'page_last': {
				index = Math.ceil(fields.length / 25) - 1;
				break;
			}

			default: {
				break;
			}
		}
	}

	// TODO: edit which components are disabled and send the message
	const paginationComponent = options.components.at(-1);
}

type AwaitMessageComponentOptions = Parameters<Message['awaitMessageComponent']>[0];
type AwaitedMessageComponent = Awaited<ReturnType<Message['awaitMessageComponent']>>;

export async function getComponentInteraction(message: Message, options: AwaitMessageComponentOptions): Promise<AwaitedMessageComponent | undefined> {
	try {
		return await message.awaitMessageComponent(options);
	} catch (error) {
		if (message.editable) {
			await message.edit({ components: [] });
		}

		logger.error(error, 'Failed to get component interaction');
	}
}

async function sendMessage(destination: Destination, options: BaseMessageOptions): Promise<Message> {
	switch (destination.type) {
		case Destinations.InteractionEditReply: {
			return destination.interaction.editReply(options);
		}

		case Destinations.TextChannelSend: {
			return destination.channel.send(options);
		}
	}
}
