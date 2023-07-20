import {
	type ChatInputCommandInteraction,
	type TextBasedChannel,
	ComponentType,
	ButtonStyle,
	type BaseMessageOptions,
	type APIEmbed,
	type Message,
	type APIEmbedField,
	type APISelectMenuOption,
} from 'discord.js';
import { Emojis } from './response-helpers.js';
import { globalLogger } from './logger.js';

const logger = globalLogger.child({
	name: 'message-component-helpers',
});

export const enum DestinationType {
	InteractionEditReply,
	TextChannelSend,
}

type Destination =
	| { readonly type: DestinationType.InteractionEditReply; readonly interaction: ChatInputCommandInteraction }
	| { readonly type: DestinationType.TextChannelSend; readonly channel: TextBasedChannel };

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

type SelectComponent = {
	type: ComponentType.ActionRow;
	components: [
		{
			type: ComponentType.StringSelect;
			custom_id: 'select';
			options: APISelectMenuOption[];
		},
	];
};

type PaginatedMessageOptions = Omit<BaseMessageOptions, 'embeds' | 'components'> & {
	embeds: APIEmbed[];
	components: [PaginationComponent] | [PaginationComponent, SelectComponent];
};

export async function sendPaginatedMessage(
	destination: Destination,
	embed: APIEmbed,
	selectable = false,
	options: BaseMessageOptions = {},
): Promise<string[] | undefined> {
	options.embeds ??= [];
	options.embeds.push(embed);

	const { fields } = embed;

	if (!fields || fields.length <= 25) {
		await sendMessage(destination, options);
		return;
	}

	const initialFields = fields.slice(0, 24) ?? [];
	embed.fields = initialFields;

	options.components = [
		{
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
		} satisfies PaginationComponent,
	];

	if (selectable) {
		options.components.push({
			type: ComponentType.ActionRow,
			components: [
				{
					type: ComponentType.StringSelect,
					custom_id: 'select',
					options: initialFields.map(({ name, value }) => {
						return {
							label: name,
							value: name,
							description: value,
						};
					}),
				},
			],
		} satisfies SelectComponent);
	}

	return startPagination(await sendMessage(destination, options), options as PaginatedMessageOptions, fields);
}

async function startPagination(message: Message, options: PaginatedMessageOptions, fields: APIEmbedField[]): Promise<string[] | undefined> {
	let index = 0;

	while (message.editable) {
		let interaction;
		try {
			// eslint-disable-next-line no-await-in-loop
			interaction = await message.awaitMessageComponent({
				idle: 300_000,
			});
		} catch (error) {
			if (message.editable) {
				// eslint-disable-next-line no-await-in-loop
				await message.edit({ components: [] });
			}

			logger.error(error, 'Failed to get component interaction');
			return;
		}

		if (interaction?.isStringSelectMenu()) {
			return interaction.values;
		}

		switch (interaction.customId) {
			case 'page_first': {
				index = 0;
				break;
			}

			case 'page_back': {
				index--;
				break;
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

		const [paginationComponent, selectComponent] = options.components;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [first, back, _, next, last] = paginationComponent.components;

		first.disabled = index === 0;
		back.disabled = index === 0;
		next.disabled = index === Math.ceil(fields.length / 25) - 1;
		last.disabled = index === Math.ceil(fields.length / 25) - 1;

		const offset = index * 25;
		const newFields = fields.slice(0 + offset, 24 + offset);

		options.embeds.at(-1)!.fields = newFields;

		if (selectComponent) {
			selectComponent.components[0].options = newFields.map(({ name, value }) => {
				return {
					label: name,
					value: name,
					description: value,
				};
			});
		}

		// eslint-disable-next-line no-await-in-loop
		await interaction.update(options);
	}
}

async function sendMessage(destination: Destination, options: BaseMessageOptions): Promise<Message> {
	switch (destination.type) {
		case DestinationType.InteractionEditReply: {
			return destination.interaction.editReply(options);
		}

		case DestinationType.TextChannelSend: {
			return destination.channel.send(options);
		}
	}
}
