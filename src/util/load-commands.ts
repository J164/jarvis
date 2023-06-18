import { readdir } from 'node:fs/promises';
import { type CacheType, type InteractionResponse, type ChatInputCommandInteraction, type AutocompleteInteraction } from 'discord.js';
import { type Logger } from 'pino';

export type ChatInputCommand<T extends CacheType> = Omit<InteractionResponse, 'interaction'> & {
	interaction: ChatInputCommandInteraction<T>;
};

export type ApplicationCommandHandler = ChatInputCommandHandler<boolean>;

export type ChatInputCommandHandler<AllowedInDm extends boolean> = {
	readonly respond: (response: ChatInputCommand<AllowedInDm extends true ? CacheType : 'cached'>, logger: Logger) => Promise<void>;
	readonly autocomplete?: (interaction: AutocompleteInteraction<AllowedInDm extends true ? CacheType : 'cached'>, logger: Logger) => Promise<void>;
	readonly allowedInDm: AllowedInDm;
	readonly name: string;
	readonly ephemeral?: boolean;
	readonly type: 'chatInputCommand';
};

export async function loadApplicationCommands(): Promise<Record<string, ApplicationCommandHandler>> {
	const modules = await readdir('./commands');
	const handlers: Record<string, ApplicationCommandHandler> = {};

	await Promise.all(
		modules.map(async (file) => {
			const { handler } = (await import(`./../commands/${file}`)) as { handler: ApplicationCommandHandler };
			handlers[handler.name] = handler;
		}),
	);

	return handlers;
}
