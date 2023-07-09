import { env } from 'node:process';
import { type Client } from 'discord.js';
import { globalLogger } from '../util/logger.js';
import { scheduleTasks } from '../util/schedule-tasks.js';

const logger = globalLogger.child({
	name: 'ready-event',
});

export async function onReady(client: Client): Promise<void> {
	await scheduleTasks(await client.users.fetch(env.USER_ID ?? ''));

	logger.info('Login success!');
}
