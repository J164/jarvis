import { type CreateCollectionOptions, type CollectionOptions } from 'mongodb';

export const BIRTHDAY_OPTIONS = {
	promoteLongs: false,
	promoteValues: false,
	promoteBuffers: false,
} satisfies CollectionOptions;

export const CREATE_BIRTHDAY = {
	promoteLongs: false,
	promoteValues: false,
	promoteBuffers: false,
	clusteredIndex: {
		key: { _date: 1 },
		unique: true,
	},
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['_date', 'name', 'date'],
			additionalProperties: false,
			properties: {
				_date: {
					bsonType: 'long',
					description: "required 64-bit integer representing milliseconds from UNIX epoch of the person's birthday",
				},
				name: {
					bsonType: 'string',
					description: "required string representing the person's name",
				},
			},
		},
	},
} satisfies CreateCollectionOptions & typeof BIRTHDAY_OPTIONS;
