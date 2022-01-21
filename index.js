/**
 * Some boilerplate code from discord.js.org
 */
require('dotenv').config();
const token = process.env.DISCORD_API_KEY;

const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const schedule = require('node-schedule');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));
client.login(token);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// TODO: schedule polls for each course here
// cs3130
// 
// const cs3130_job = schedule.scheduleJob('40 13-15 * * 2,4', )

// cs3500
// const cs3500_job = schedule.scheduleJob('0 12-14 * * 2,4', )

// cs3200
// const cs3200_job = schedule.scheduleJob('25 11-13 * * 1,3', )

// cs4400
// const cs4400_job = schedule.scheduleJob('50 9-11 * * 1,3', )

const scraper = require('./scrapers.js');

// async function func() {
// 	console.log(await scraper.getCovidText());
// }

// func();

