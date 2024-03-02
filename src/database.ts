import {
	type Collection,
	type CreateCollectionOptions,
	type IndexDescription,
	type Document,
	type Db,
	type CollectionOptions,
	type MongoClient,
} from 'mongodb';

type UnpromotedCollectionOptions = { readonly promoteLongs: false; readonly promoteValues: false; readonly promoteBuffers: false };

/** Options to define a mongodb collection */
export type MongoCollectionOptions = {
	readonly baseOptions: CollectionOptions & UnpromotedCollectionOptions;
	readonly createOptions: CreateCollectionOptions & UnpromotedCollectionOptions & { validator: Document };
	readonly indexOptions: IndexDescription[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = { client: MongoClient; db: Db; collectionNames: string[]; collections: Record<string, Collection<any>> };

export async function fetchCollection<T extends Document>(this: Database, name: string, options: MongoCollectionOptions): Promise<Collection<T>> {
	const { baseOptions, createOptions, indexOptions } = options;

	return (this.collections[name] ??= this.collectionNames.includes(name)
		? this.db.collection<T>(name, baseOptions)
		: await createCollection<T>(name, this.db, createOptions, indexOptions));
}

async function createCollection<T extends Document>(
	name: string,
	db: Db,
	createOptions: CreateCollectionOptions,
	indexOptions: IndexDescription[],
): Promise<Collection<T>> {
	const collection = await db.createCollection<T>(name, createOptions);

	if (indexOptions.length > 0) {
		await collection.createIndexes(indexOptions);
	}

	return collection;
}
