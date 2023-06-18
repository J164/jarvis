import { type ApplicationCommandDataResolvable } from 'discord.js';

/** The bot's application commands */
export const APPLICATION_COMMANDS = [
	{
		name: 'tasks',
		description: 'Lists currently registered tasks',
	},
] satisfies ApplicationCommandDataResolvable[];
