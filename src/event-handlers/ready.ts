import { globalLogger } from '../util/logger.js';
import { scheduleTasks } from '../util/schedule-tasks.js';

const logger = globalLogger.child({
	name: 'ready-event',
});

export async function onReady(): Promise<void> {
	await scheduleTasks();

	logger.info('Login success!');
}
