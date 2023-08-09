import { type CreateCollectionOptions, type CollectionOptions, type Document, type IndexDescription } from 'mongodb';
import { type Collections } from './database.js';

type UnpromotedCollectionOptions = { promoteLongs: false; promoteValues: false; promoteBuffers: false };

type Options = Record<
	keyof Collections,
	{
		baseOptions: CollectionOptions & UnpromotedCollectionOptions;
		createOptions: CreateCollectionOptions & UnpromotedCollectionOptions & { validator: Document };
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
					required: ['_id', '_date', '_name'],
					additionalProperties: false,
					properties: {
						_id: {
							bsonType: 'objectId',
							description: 'required unique id of database entry',
						},
						_date: {
							bsonType: 'int',
							description: "required 32-bit integer representing the person's birthday in the format MMDD",
						},
						_name: {
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
			{
				key: {
					_name: 1,
				},
				unique: true,
			},
		],
	},
} satisfies Options;
