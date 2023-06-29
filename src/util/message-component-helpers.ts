import {
	type ChatInputCommandInteraction,
	type TextBasedChannel,
	ComponentType,
	ButtonStyle,
	type BaseMessageOptions,
	type APIEmbed,
	type Message,
	type APIEmbedField,
} from 'discord.js';
import { Emojis } from './response-helpers.js';
import { globalLogger } from './logger.js';

const logger = globalLogger.child({
	name: 'message-component-helpers',
});

export const enum Destinations {
	InteractionEditReply,
	TextChannelSend,
}

type Destination =
	| { type: Destinations.InteractionEditReply; interaction: ChatInputCommandInteraction }
	| { type: Destinations.TextChannelSend; channel: TextBasedChannel };

type PaginationComponent = {
	type: ComponentType.ActionRow;
	components: [
		{
			type: ComponentType.Button;
			custom_id: 'page_first';
			style: ButtonStyle.Secondary;
			label: 'Beginning';
			emoji: { name: Emojis.DoubleArrowLeft };
			disabled: boolean;
		},
		{
			type: ComponentType.Button;
			custom_id: 'page_back';
			style: ButtonStyle.Secondary;
			label: 'Previous';
			emoji: { name: Emojis.ArrowLeft };
			disabled: boolean;
		},
		{
			type: ComponentType.Button;
			custom_id: 'page_close';
			style: ButtonStyle.Danger;
			label: 'Close';
			emoji: { name: Emojis.RedX };
			disabled: false;
		},
		{
			type: ComponentType.Button;
			custom_id: 'page_next';
			style: ButtonStyle.Secondary;
			label: 'Next';
			emoji: { name: Emojis.ArrowRight };
			disabled: boolean;
		},
		{
			type: ComponentType.Button;
			custom_id: 'page_last';
			style: ButtonStyle.Secondary;
			label: 'End';
			emoji: { name: Emojis.DoubleArrowRight };
			disabled: boolean;
		},
	];
};

type PaginatedMessageOptions = Omit<BaseMessageOptions, 'embeds' | 'components'> & {
	embeds: APIEmbed[];
	components: [...NonNullable<BaseMessageOptions['components']>, PaginationComponent];
};

export async function sendPaginatedMessage(destination: Destination, embed: APIEmbed, options: BaseMessageOptions = {}): Promise<void> {
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [first, back, _, next, last] = (options.components.at(-1) as PaginationComponent).components;

		first.disabled = index === 0;
		back.disabled = index === 0;
		next.disabled = index === Math.ceil(fields.length / 25) - 1;
		last.disabled = index === Math.ceil(fields.length / 25) - 1;

		const offset = index * 25;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		options.embeds.at(-1)!.fields = fields.slice(0 + offset, 24 + offset);

		// eslint-disable-next-line no-await-in-loop
		await sendMessage(destination, options);
	}
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
