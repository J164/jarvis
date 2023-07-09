import { env } from 'node:process';
import { type Collection, MongoClient, type CreateCollectionOptions, type IndexDescription, type Document, type Db } from 'mongodb';
import { type Birthday } from '../tasks/birthdays.js';
import { COLLECTION_OPTIONS } from './collection-options.js';

export type Collections = {
	birthdays?: Collection<Birthday>;
};

let collectionNames: string[];
let database: Db;
const collections: Collections = {};

export async function fetchCollection<T extends keyof Collections>(name: T): Promise<NonNullable<Collections[T]>> {
	if (!database) {
		const databaseClient = new MongoClient(env.MONGO_URL ?? '');
		await databaseClient.connect();
		database = databaseClient.db(env.DATABASE_NAME);
	}

	collectionNames ??= await database
		.listCollections()
		.map((info) => {
			return info.name;
		})
		.toArray();

	const { baseOptions, createOptions, indexOptions } = COLLECTION_OPTIONS.birthdays;

	return (collections[name] ??= collectionNames.includes(name)
		? database.collection(name, baseOptions)
		: await createCollection<Birthday>(name, createOptions, indexOptions));
}

async function createCollection<T extends Document>(
	name: string,
	createOptions: CreateCollectionOptions,
	indexOptions: IndexDescription[],
): Promise<Collection<T>> {
	const collection = await database.createCollection<T>(name, createOptions);

	if (indexOptions.length > 0) {
		await collection.createIndexes(indexOptions);
	}

	return collection;
}
