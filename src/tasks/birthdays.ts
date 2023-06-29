import { type Task } from '../util/schedule-tasks.js';

export const task: Task = {
	cronExpression: '* * * * * *',
	scheduleOptions: { name: 'birthdays' },
	handler() {
		// TODO: implement
	},
};
