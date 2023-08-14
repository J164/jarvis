import { beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Int32, MongoClient } from 'mongodb';
import { type CollectionFetcher, fetchCollection } from '@j164/bot-framework';
import * as CollectionOptions from './collection-options.js';
import { BIRTHDAY_COLLECTION } from './collection-options.js';

describe.each(Object.values(CollectionOptions))('collection creation options', (collection) => {
	it('should extend its respective collection options', () => {
		for (const [key, value] of Object.entries(collection.baseOptions)) {
			expect(collection.createOptions[key]).toEqual(value);
		}
	});
});

describe('birthday collection options', () => {
	let collectionFetcher: CollectionFetcher;

	beforeAll(async () => {
		const server = await MongoMemoryServer.create();
		const client = new MongoClient(server.getUri());
		await client.connect();
		collectionFetcher = fetchCollection.bind({ client, db: client.db('birthday-options'), collectionNames: [], collections: {} });
	});

	it('should correctly validate documents', async () => {
		const collection = await collectionFetcher('birthdays', BIRTHDAY_COLLECTION);

		expect(await collection.insertOne({ _name: 'valid', _date: new Int32(1031) })).toBeDefined();

		await expect(async () => collection.insertOne({ _date: new Int32(1031) })).rejects.toThrow();
		await expect(async () => collection.insertOne({ _name: 'missing_date' })).rejects.toThrow();

		await expect(async () => collection.insertOne({ _name: new Int32(123), _date: new Int32(1031) })).rejects.toThrow();
		await expect(async () => collection.insertOne({ _name: 'invalid_date_type', _date: 'test' })).rejects.toThrow();
	});

	it('should not allow duplicate names', async () => {
		const collection = await collectionFetcher('birthdays', BIRTHDAY_COLLECTION);

		await collection.insertOne({ _name: 'not_unique', _date: new Int32(1111) });

		await expect(async () => collection.insertOne({ _name: 'not_unique', _date: new Int32(1201) })).rejects.toThrow();
	});

	it.todo('should allow duplicate dates');
});
