import { env } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { EmbedType, type Task, responseOptions } from '@j164/bot-framework';

// TODO: determine which properties are needed
type Laundry = {
	objects: Array<{
		appliance_type: 'W' | 'D';
		status_toggle: 0 | 3;
	}>;
};

export const task: Task = {
	cronExpression: '0 0 1 1 1', // TODO: temporary cron expression until task is ready
	scheduleOptions: { name: 'laundry' },
	async handler(context) {
		const user = await context.botClient.client.users.fetch(env.USER_ID ?? '');
		const dm = await user.createDM();

		const req = await fetch(
			`https://www.laundryview.com/api/currentRoomData?school_desc_key=${env.LAUNDRY_SCHOOL ?? ''}&location=${env.LAUNDRY_LOCATION ?? ''}&rdm=${Date.now()}`,
		);

		if (!req.ok) {
			context.taskLogger.error(req.json(), `Fetching laundry info failed with status text: "${req.statusText}"`);
			return;
		}

		const { objects } = (await req.json()) as Laundry;

		if (
			objects.some(({ appliance_type, status_toggle }) => {
				return appliance_type === 'W' && status_toggle === 0;
			})
		) {
			await dm.send(responseOptions(EmbedType.Info, 'A washer is available!'));

			context.task.stop();
			await setTimeout(900_000);
			context.task.start();
		}
	},
};
