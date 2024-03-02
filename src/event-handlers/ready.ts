import { type ScheduledTask, schedule } from 'node-cron';
import { type TaskContext, type BotClient, type Task } from '../bot-client.js';

export function onReady(this: BotClient, taskHandlers: Task[]): void {
	for (const { cronExpression, handler, scheduleOptions } of taskHandlers) {
		const info: Omit<TaskContext, 'task'> & { task?: ScheduledTask } = {
			botClient: this,
			taskLogger: this.globalLogger.child({ type: 'task', taskName: scheduleOptions.name }),
		};
		info.task = schedule(cronExpression, handler.bind(undefined, info as TaskContext), scheduleOptions);
	}

	this.globalLogger.info('Login success!');
}
