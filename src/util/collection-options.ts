import { type MongoCollectionOptions } from '@j164/bot-framework';

export const BIRTHDAY_COLLECTION = {
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
} satisfies MongoCollectionOptions;
