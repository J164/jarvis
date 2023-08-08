import { env } from 'node:process';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { type InteractionEditReplyOptions } from 'discord.js';
import { type CollectionFetcher } from '../database/database.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';
import { handler } from './remove-birthday.js';

describe('remove-birthday respond function', () => {
	let server: MongoMemoryServer;
	let fetchCollection: CollectionFetcher;

	beforeAll(async () => {
		server = await MongoMemoryServer.create();
		env.MONGODB_URL = server.getUri();
		env.DATABASE_NAME = 'remove-birthday';
		const database = await import('../database/database.js');
		fetchCollection = database.fetchCollection;
	});

	it('should exit early if there are no birthday reminders to remove', async () => {
		const editReply = vi.fn<[InteractionEditReplyOptions], unknown>();

		await handler.respond({ interaction: { editReply } }, { fetchCollection });
		expect(editReply.mock.lastCall?.at(0)).toEqual(responseOptions(EmbedType.Error, 'There are no birthday reminders to remove'));
	});
});
