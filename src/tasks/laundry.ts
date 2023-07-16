import { env } from 'node:process';
import { type Task } from '../util/schedule-tasks.js';
import { globalLogger } from '../util/logger.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';

const logger = globalLogger.child({
	name: 'laundry-task',
});

// TODO: determine which properties are needed
type Laundry = {
	objects: Array<{
		appliance_type: 'W' | 'D';
		status_toggle: 0 | 3;
	}>;
};

export const task: Task = {
	cronExpression: '',
	scheduleOptions: { name: 'laundry' },
	async handler(target) {
		const dm = await target.createDM();

		const req = await fetch(
			`https://www.laundryview.com/api/currentRoomData?school_desc_key=${env.LAUNDRY_SCHOOL ?? ''}&location=${env.LAUNDRY_LOCATION ?? ''}&rdm=${Date.now()}`,
		);

		if (!req.ok) {
			logger.error(req.json(), `Fetching laundry info failed with status text: "${req.statusText}"`);
			return;
		}

		const { objects } = (await req.json()) as Laundry;

		if (
			objects.some(({ appliance_type, status_toggle }) => {
				return appliance_type === 'W' && status_toggle === 0;
			})
		) {
			await dm.send(responseOptions(EmbedType.Info, 'A washer is available!'));
		}

		// TODO: add helper methods to parameters for pausing task scheduling
	},
};
