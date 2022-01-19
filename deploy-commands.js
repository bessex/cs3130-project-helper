/**
 * Some boilerplate code from discord.js.org
 */
require('dotenv').config();
const token = process.env.DISCORD_API_KEY;
const clientId = process.env.APPLICATION_ID;

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];

// read commands from commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// add command info to Collection
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    const cmdJson = command.data.toJSON();
	commands.push(cmdJson);
    console.log(`Pushed /${cmdJson}`)
}

const rest = new REST({ version: '9' }).setToken(token);

// register commands with Discord
rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);