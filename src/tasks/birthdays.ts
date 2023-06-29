import { type Long } from 'mongodb';
import { type Task } from '../util/schedule-tasks.js';

export type Birthday = {
	_date: Long;
	name: string;
};

export const task: Task = {
	cronExpression: '0 13 * * *',
	scheduleOptions: { name: 'birthdays' },
	handler() {
		// TODO: implement
	},
};
