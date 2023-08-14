import { readdir } from 'node:fs/promises';
import { type ApplicationCommandHandler, type ApplicationCommandHandlers } from '@j164/bot-framework';

export async function loadApplicationCommands(): Promise<ApplicationCommandHandlers> {
	const modules = await readdir('./application-commands');
	const handlers: ApplicationCommandHandlers = {};

	await Promise.all(
		modules.map(async (file) => {
			const { handler } = (await import(`./../application-commands/${file}`)) as { handler: ApplicationCommandHandler };
			handlers[handler.name] = handler;
		}),
	);

	return handlers;
}
