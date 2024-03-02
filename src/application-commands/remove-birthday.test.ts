/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { type InteractionEditReplyOptions } from 'discord.js';
import { Int32, MongoClient } from 'mongodb';
import { BIRTHDAY_COLLECTION } from '../util/collection-options.js';
import { type CollectionFetcher } from '../bot-client.js';
import { fetchCollection } from '../database.js';
import { EmbedType, responseOptions } from '../util/response-helpers.js';
import { handler } from './remove-birthday.js';

describe('remove-birthday respond function', () => {
	let collectionFetcher: CollectionFetcher;

	beforeAll(async () => {
		const server = await MongoMemoryServer.create();
		const client = new MongoClient(server.getUri());
		await client.connect();
		collectionFetcher = fetchCollection.bind({ client, db: client.db('remove-birthday'), collectionNames: [], collections: {} });
	});

	it('should exit early if there are no birthday reminders to remove', async () => {
		const editReply = vi.fn<[InteractionEditReplyOptions], unknown>();

		await handler.respond({ interaction: { editReply } }, { botClient: { fetchCollection: collectionFetcher } });
		expect(editReply.mock.lastCall?.at(0)).toEqual(responseOptions(EmbedType.Error, 'There are no birthday reminders to remove'));
	});

	it('should remove the selected birthday reminder', async () => {
		const collection = await collectionFetcher('birthdays', BIRTHDAY_COLLECTION);
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
			{ botClient: { fetchCollection: collectionFetcher } },
		);

		// eslint-disable-next-line unicorn/no-null
		expect(await collection.findOne({ _name: 'test' })).toBe(null);
	});
});
