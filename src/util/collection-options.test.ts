import { env } from 'node:process';
import { beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Int32 } from 'mongodb';
import { fetchCollection } from '@j164/bot-framework';
import { type Birthday } from '../tasks/birthdays.js';
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
	beforeAll(async () => {
		const server = await MongoMemoryServer.create();
		env.MONGO_URL = server.getUri();
		env.DATABASE_NAME = 'remove-birthday';
	});

	it('should correctly validate documents', async () => {
		const collection = await fetchCollection<Birthday>('birthdays', env.MONGO_URL ?? '', BIRTHDAY_COLLECTION);

		expect(await collection.insertOne({ _name: 'valid', _date: new Int32(1031) })).toBeDefined();

		await expect(async () => collection.insertOne({ _date: new Int32(1031) })).rejects.toThrow();
		await expect(async () => collection.insertOne({ _name: 'missing_date' })).rejects.toThrow();

		await expect(async () => collection.insertOne({ _name: new Int32(123), _date: new Int32(1031) })).rejects.toThrow();
		await expect(async () => collection.insertOne({ _name: 'invalid_date_type', _date: 'test' })).rejects.toThrow();
	});

	it('should not allow duplicate names', async () => {
		const collection = await fetchCollection<Birthday>('birthdays', env.MONGO_URL ?? '', BIRTHDAY_COLLECTION);

		await collection.insertOne({ _name: 'not_unique', _date: new Int32(1111) });

		await expect(async () => collection.insertOne({ _name: 'not_unique', _date: new Int32(1201) })).rejects.toThrow();
	});

	it.todo('should allow duplicate dates');
});
