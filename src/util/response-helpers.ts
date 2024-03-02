import { type APIEmbed, type BaseMessageOptions } from 'discord.js';

/** Enum of embed format types */
export enum EmbedType {
	Info,
	Error,
	Success,
	Prompt,
	None,
}

/** Enum of Discord emojis */
export enum Emojis {
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
export enum BotColors {
	DefaultBlue = 0x00_99_ff,
	ErrorRed = 0xff_00_00,
	SuccessGreen = 0x00_ff_00,
	QuestionOrange = 0xff_a5_00,
}

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
