import { type CreateCollectionOptions, type CollectionOptions, type IndexDescription } from 'mongodb';
import { type Collections } from './database.js';

type UnpromotedCollectionOptions = { promoteLongs: false; promoteValues: false; promoteBuffers: false };

type Options = Record<
	keyof Collections,
	{
		baseOptions: CollectionOptions & UnpromotedCollectionOptions;
		createOptions: CreateCollectionOptions & UnpromotedCollectionOptions;
		indexOptions: IndexDescription[];
	}
>;

export const COLLECTION_OPTIONS = {
	birthdays: {
		baseOptions: {
			promoteLongs: false,
			promoteValues: false,
			promoteBuffers: false,
		},
		createOptions: {
			promoteLongs: false,
			promoteValues: false,
			promoteBuffers: false,
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['_date', 'name'],
					additionalProperties: false,
					properties: {
						_date: {
							bsonType: 'int',
							description: "required 32-bit integer representing the person's birthday in the format MMDD",
						},
						name: {
							bsonType: 'string',
							description: "required string representing the person's name",
						},
					},
				},
			},
		},
		indexOptions: [
			{
				key: {
					_date: 1,
				},
			},
		],
	},
} satisfies Options;
