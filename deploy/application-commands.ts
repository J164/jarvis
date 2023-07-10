import { type ApplicationCommandDataResolvable } from 'discord.js';

/** The bot's application commands */
export const APPLICATION_COMMANDS = [
	{
		name: 'tasks',
		description: 'Lists currently registered tasks',
	},
	{
		name: 'add-birthday',
		description: 'Adds a birthday to be reminded of',
	},
] satisfies ApplicationCommandDataResolvable[];
