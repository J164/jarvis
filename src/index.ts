import { env } from 'node:process';
import { ActivityType, GatewayIntentBits, Partials } from 'discord.js';
import { loadApplicationCommands } from './util/load-commands.js';
import { loadTasks } from './util/load-tasks.js';
import { startBot } from './bot-client.js';

const [commandHandlers, taskHandlers] = await Promise.all([loadApplicationCommands(), loadTasks()]);

await startBot({
	token: env.TOKEN ?? '',
	databaseUrl: env.MONGO_URL ?? '',
	clientOptions: {
		intents: [GatewayIntentBits.Guilds],
		partials: [Partials.Channel],
		presence: {
			activities: [{ name: env.STATUS ?? '', type: ActivityType.Playing }],
		},
	},
	commandHandlers,
	taskHandlers,
});
