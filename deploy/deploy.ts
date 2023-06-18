import { env } from 'node:process';
import { REST, Routes } from 'discord.js';
import { APPLICATION_COMMANDS } from './application-commands.js';

await new REST({ version: '10' })
	.setToken(env.npm_config_bot_token ?? '')
	.put(Routes.applicationCommands(env.npm_config_bot_id ?? ''), { body: APPLICATION_COMMANDS });
