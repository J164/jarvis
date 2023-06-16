import { globalLogger } from '../util/logger.js';

const logger = globalLogger.child({
	name: 'ready-event',
});

export function onReady(): void {
	logger.info('Login success!');
}
