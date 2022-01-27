/**
 * Some boilerplate code from discord.js.org
 */
require('dotenv').config();
const token = process.env.DISCORD_API_KEY;

const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
const schedule = require('node-schedule');
const weather = require('./commands/weather.js');
const date = require('date-and-time');

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

const channels = new Set();

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	const cId = interaction.channelId;

	if (command.data.name == 'subscribe') {
		channels.add(cId);
	}

	if (command.data.name == 'unsubscribe') {
		channels.delete(cId);
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

const opwToken = process.env.OPENWEATHER_TOKEN;
const opwCity = process.env.OPENWEATHER_CITY_ID;

const { Weather } = require('./weather-tracker.js');
const tracker = new Weather(opwToken, opwCity);

async function init_tracker(){
	await tracker.poll();
	await tracker.poll();
	await tracker.poll();
}

// we want at least three datapoints before we begin reporting--otherwise probably will crash with current implementation
init_tracker().then(() => {

	const test_poll_weather = schedule.scheduleJob('* 7-20 * * 1-5', () => tracker.poll());

	test_poll_weather.on('success', () => {
		if (isWithinFiveMinutes('1:50 PM')) {
			post(tracker, 'Testing (it\'s working!)', client, channels);
		}
	});

	// cs3130
	const cs3130_poll_job = schedule.scheduleJob('40 13-15 * * 2,4', () => tracker.poll());

	cs3130_poll_job.on('success', () => {
		if (isWithinFiveMinutes('1:25 PM')) {
			post(tracker, 'cs3130', client, channels);
		}
	});

	// const cs3130_post_job = schedule.scheduleJob('40 15 * * 2,4', () => post(tracker, 'cs3130', client, channels));

	// cs3500
	const cs3500_poll_job = schedule.scheduleJob('0 10-14 * * 2,4', () => tracker.poll());

	cs3500_poll_job.on('success', () => {
		if (isWithinFiveMinutes('2:00 PM')) {
			post(tracker, 'cs3500', client, channels);
		}
	});

	// const cs3500_post_job = schedule.scheduleJob('0 14 * * 2,4', () => post(tracker, 'cs3500', client, channels));

	// cs3200
	const cs3200_poll_job = schedule.scheduleJob('25 11-13 * * 1,3', () => tracker.poll());

	cs3200_poll_job.on('success', () => {
		if (isWithinFiveMinutes('1:25 PM')) {
			post(tracker, 'cs3200', client, channels);
		}
	});

	// const cs3200_post_job = schedule.scheduleJob('25 13 * * 1,3', () => post(tracker, 'cs3200', client, channels));

	// cs4400
	const cs4400_poll_job = schedule.scheduleJob('50 9-11 * * 1,3', () => tracker.poll());

	cs4400_poll_job.on('success', () => {
		if (isWithinFiveMinutes('11:50 AM')) {
			post(tracker, 'cs4400', client, channels);
		}
	});

	// const cs4400_post_job = schedule.scheduleJob('50 11 * * 1,3', () => post(tracker, 'cs4400', client, channels));
})


function isWithinFiveMins(hhmmA) {
	const nowFull = new Date(Date.now());

	const nowShort = new Date();
	nowShort.setHours(nowFull.getHours());
	nowShort.setMinutes(nowFull.getMinutes());

	const refTime = date.parse(hhmmA, 'hh:mm A')

	const delta = Math.abs(nowShort.getTime() - refTime.getTime());

	return Math.floor(delta / 1000) < (5 * 60);
}



/**
 * 
 * @param {Weather} weather 
 * @param {String} courseName 
 * @param {Client} client
 * @param {Set} channels 
 */
async function post(weather, courseName, client, channels) {
	const scraper = require('./scrapers.js');
 	const covid = await scraper.getCovidData();
	const wList = await weather.get(Date.now() * 1000);

    daydate = date.format(new Date(covid.dt), 'DD MMM YYYY, HH:mm');

    const covidText = 
        `**Univ of Utah COVID Cases on ${daydate}** \
        \nTotal New Cases:             ${covid.newCases} \
        \n7-day Avg New Cases:   ${covid.weeklyAvg}`;

	const tm0 = wList[0].dt;
	const tm0_string = date.format(tm0, 'HH:mm');
	const tm0_temp = wList[0].temp;
	const city = wList[0].city;
	const w = wList[0].weather;

	const tm1 = wList[1].dt;
	const tm1_string = date.format(tm1, 'HH:mm');
	const tm1_temp = wList[1].temp;

	const tm2 = wList[2].dt;
	const tm2_string = date.format(tm2, 'HH:mm');
	const tm2_temp = wList[2].temp;

	const weatherText = `**${city} Weather:** \
        \nTemp (F)\t @ ${tm2_string} – ${tm2_temp} \
		\n\t\t\t\t\t\t@ ${tm1_string} – ${tm1_temp} \
		\n\t\t\t\t\t\t@ ${tm0_string} – ${tm0_temp}
        \nWeather: ${w}`;

	const postText = `**Data for ${courseName}:** \
		\n\
		\n${covidText}\
		\n\
		\n${weatherText}`;
	
	channels.forEach((cId) => {
		client.channels.fetch(cId)
			.then(channel => channel.send(postText));
	});
}
