import {
	type AutocompleteInteraction,
	type CacheType,
	type ChatInputCommandInteraction,
	Client,
	type InteractionResponse,
	type ClientOptions,
} from 'discord.js';
import { pino, type Logger } from 'pino';
import { type ScheduledTask, type ScheduleOptions } from 'node-cron';
import { MongoClient, type Document, type Collection } from 'mongodb';
import { onReady } from './event-handlers/ready.js';
import { onInteractionCreate } from './event-handlers/interaction-create.js';
import { type MongoCollectionOptions, fetchCollection } from './database.js';

export type Task = {
	readonly cronExpression: string;
	readonly handler: (context: TaskContext) => void;
	readonly scheduleOptions: ScheduleOptions & { name: string };
};

export type ChatInputCommandHandler<AllowedInDm extends boolean> = {
	readonly respond: (response: ChatInputCommand<AllowedInDm extends true ? CacheType : 'cached'>, commandContext: CommandContext) => Promise<void>;
	readonly autocomplete?: (interaction: AutocompleteInteraction<AllowedInDm extends true ? CacheType : 'cached'>, logger: Logger) => Promise<void>;
	readonly allowedInDm: AllowedInDm;
	readonly name: string;
	readonly ephemeral?: boolean;
	readonly type: 'chatInputCommand';
};

export type ApplicationCommandHandler = ChatInputCommandHandler<boolean>;
export type ApplicationCommandHandlers = Record<string, ApplicationCommandHandler>;

export type TaskContext = { readonly botClient: BotClient; readonly task: ScheduledTask; readonly taskLogger: Logger };
export type CommandContext = { readonly botClient: BotClient; readonly commandLogger: Logger };

export type ChatInputCommand<T extends CacheType> = Omit<InteractionResponse, 'interaction'> & {
	interaction: ChatInputCommandInteraction<T>;
};

export type CollectionFetcher = <T extends Document>(name: string, options: MongoCollectionOptions) => Promise<Collection<T>>;

export type BotClient = { readonly client: Client; readonly globalLogger: Logger; readonly fetchCollection: CollectionFetcher };

export async function startBot(options: {
	token: string;
	clientOptions: ClientOptions;
	databaseUrl: string;
	commandHandlers: ApplicationCommandHandlers;
	taskHandlers: Task[];
}): Promise<void> {
	const { token, clientOptions, databaseUrl, commandHandlers, taskHandlers } = options;

	const client = new MongoClient(databaseUrl);
	await client.connect();
	const db = client.db();

	const context: Omit<BotClient, 'client'> & { client?: Client } = {
		globalLogger: pino(),
		fetchCollection: fetchCollection.bind<CollectionFetcher>({
			client,
			db,
			collectionNames: await db
				.listCollections()
				.map((info) => {
					return info.name;
				})
				.toArray(),
			collections: {},
		}),
	};
	context.client = new Client(clientOptions)
		.once('ready', onReady.bind(context as BotClient, taskHandlers))
		.on('interactionCreate', onInteractionCreate.bind(context as BotClient, commandHandlers));

	await context.client.login(token);
}
