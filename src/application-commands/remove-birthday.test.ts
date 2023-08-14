/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { env } from 'node:process';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { type InteractionEditReplyOptions } from 'discord.js';
import { Int32 } from 'mongodb';
import { EmbedType, fetchCollection, responseOptions } from '@j164/bot-framework';
import { BIRTHDAY_COLLECTION } from '../util/collection-options.js';
import { type Birthday } from '../tasks/birthdays.js';
import { handler } from './remove-birthday.js';

describe('remove-birthday respond function', () => {
	beforeAll(async () => {
		const server = await MongoMemoryServer.create();
		env.MONGO_URL = server.getUri();
		env.DATABASE_NAME = 'remove-birthday';
	});

	it('should exit early if there are no birthday reminders to remove', async () => {
		const editReply = vi.fn<[InteractionEditReplyOptions], unknown>();

		await handler.respond({ interaction: { editReply } }, { fetchCollection });
		expect(editReply.mock.lastCall?.at(0)).toEqual(responseOptions(EmbedType.Error, 'There are no birthday reminders to remove'));
	});

	it('should remove the selected birthday reminder', async () => {
		const collection = await fetchCollection<Birthday>('birthdays', env.MONGO_URL ?? '', BIRTHDAY_COLLECTION);
		await collection.insertOne({ _name: 'test', _date: new Int32(1110) });

		await handler.respond(
			{
				interaction: {
					editReply() {
						return {
							editable: true,
							awaitMessageComponent() {
								return {
									isStringSelectMenu() {
										return true;
									},
									// eslint-disable-next-line @typescript-eslint/no-empty-function
									update() {},
									values: ['test'],
								};
							},
						};
					},
				},
			},
			{ fetchCollection },
		);

		// eslint-disable-next-line unicorn/no-null
		expect(await collection.findOne({ _name: 'test' })).toBe(null);
	});
});
