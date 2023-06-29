import { env } from 'node:process';
import { type Collection, MongoClient } from 'mongodb';
import { globalLogger } from '../util/logger.js';
import { type Birthday } from '../tasks/birthdays.js';
import { BIRTHDAY_OPTIONS, CREATE_BIRTHDAY } from './collection-options.js';

export const databaseLogger = globalLogger.child({
	name: 'database',
});

const databaseClient = new MongoClient(env.MONGO_URL ?? '');
await databaseClient.connect();

const database = databaseClient.db(env.DATABASE_NAME);

export const [birthdayCollection] = await fetchCollections();

async function fetchCollections(): Promise<[Collection<Birthday>]> {
	const collectionList = await database.collections();
	const collections = new Set<string>();

	for (const collection of collectionList) {
		collections.add(collection.collectionName);
	}

	return Promise.all([
		collections.has('birthday') ? database.collection('birthday', BIRTHDAY_OPTIONS) : await database.createCollection<Birthday>('birthday', CREATE_BIRTHDAY),
	]);
}
