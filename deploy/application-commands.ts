import { ApplicationCommandOptionType, type ApplicationCommandDataResolvable } from 'discord.js';

/** The bot's application commands */
export const APPLICATION_COMMANDS = [
	{
		name: 'tasks',
		description: 'Lists currently registered tasks',
	},
	{
		name: 'add-birthday',
		description: 'Adds a birthday to be reminded of',
		options: [
			{
				name: 'name',
				description: "The name of the person who's birthday is being added",
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'month',
				description: 'The month the birthday is in',
				type: ApplicationCommandOptionType.Integer,
				required: true,
				choices: [
					{
						name: 'January',
						value: 0,
					},
					{
						name: 'February',
						value: 1,
					},
					{
						name: 'March',
						value: 2,
					},
					{
						name: 'April',
						value: 3,
					},
					{
						name: 'May',
						value: 4,
					},
					{
						name: 'June',
						value: 5,
					},
					{
						name: 'July',
						value: 6,
					},
					{
						name: 'August',
						value: 7,
					},
					{
						name: 'September',
						value: 8,
					},
					{
						name: 'October',
						value: 9,
					},
					{
						name: 'November',
						value: 10,
					},
					{
						name: 'December',
						value: 11,
					},
				],
			},
			{
				name: 'day',
				description: 'The day the birthday is on',
				type: ApplicationCommandOptionType.Integer,
				required: true,
				min_value: 1,
				max_value: 32,
			},
		],
	},
	{
		name: 'remove-birthday',
		description: 'Removes the birthday reminder for the specified user',
		options: [
			{
				name: 'name',
				description: 'The name associated with the birthday reminder to remove',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
		],
	},
] satisfies ApplicationCommandDataResolvable[];
