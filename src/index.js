const fs = require('fs');
const dataDir = process.env.DATA_DIRECTORY;
const channelsFile = `${dataDir}/channels.txt`;

const schedule = require('node-schedule');
const date = require('date-and-time');

const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const token = process.env.DISCORD_API_KEY;
client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));
client.login(token);

/**
 * Saves given channels to file
 * @param {Set} channels set of channels to save
 */
function saveChannelsToFile(channels) {
	const stream = fs.createWriteStream(channelsFile);
	channels.forEach((cId) => {
		console.log(`Writing ${cId}`);
		stream.write(cId  + '\n');
	});
}

/**
 * Loads set of channels from file
 * @returns {Set} the set of channels
 */
function loadChannelsFromFile() {
	const channels = new Set();
	
	if (!fs.existsSync(channelsFile)) {
		return channels;
	}
	
	const stream = fs.createReadStream(channelsFile);
	const readline = require('readline');
	const rl = readline.createInterface(stream);

	rl.on('line', (cId) => {
		console.log(`Read ${cId}`)
		channels.add(cId);
	});
	
	return channels;
}

const channels = loadChannelsFromFile();

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	const cId = interaction.channelId;

	if (command.data.name == 'subscribe') {
		channels.add(cId);
		saveChannelsToFile(channels);
	}

	if (command.data.name == 'unsubscribe') {
		channels.delete(cId);
		saveChannelsToFile(channels);
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
const { Console } = require('console');
const tracker = new Weather(opwToken, opwCity);

async function init_tracker() {
	await tracker.poll();
	await tracker.poll();
	await tracker.poll();
}

const DEBUG = false;

// we want at least three datapoints before we begin reporting--otherwise probably will crash with current implementation
init_tracker().then(() => {

	if (DEBUG) {
		const test_poll_weather = schedule.scheduleJob('* 7-20 * * 1-5', () => tracker.poll());

		test_poll_weather.on('success', () => {
			if (isWithinFiveMinutes(17, 16)) {
				post(tracker, 'Testing (it\'s working!)', client, channels);
			}
		});

	}

	// cs5140
	const cs5140_poll_job = schedule.scheduleJob('10 13-15 * * 1,3,5', () => tracker.poll());

	cs5140_poll_job.on('success', () => {
		if (isWithinFiveMinutes(15, 10)) {
			post(tracker, 'cs5140', client, channels);
		}
	});

	// cs3130
	const cs3130_poll_job = schedule.scheduleJob('40 13-15 * * 2,4', () => tracker.poll());

	cs3130_poll_job.on('success', () => {
		if (isWithinFiveMinutes(15, 40)) {
			post(tracker, 'cs3130', client, channels);
		}
	});

	// cs3500
	const cs3500_poll_job = schedule.scheduleJob('0 10-14 * * 2,4', () => tracker.poll());

	cs3500_poll_job.on('success', () => {
		if (isWithinFiveMinutes(14, 00)) {
			post(tracker, 'cs3500', client, channels);
		}
	});

	// cs3200
	const cs3200_poll_job = schedule.scheduleJob('25 11-13 * * 1,3', () => tracker.poll());

	cs3200_poll_job.on('success', () => {
		if (isWithinFiveMinutes(13, 25)) {
			post(tracker, 'cs3200', client, channels);
		}
	});

	// cs4400
	const cs4400_poll_job = schedule.scheduleJob('50 9-11 * * 1,3', () => tracker.poll());

	cs4400_poll_job.on('success', () => {
		if (isWithinFiveMinutes(11, 50)) {
			post(tracker, 'cs4400', client, channels);
		}
	});
})


function isWithinFiveMinutes(HH, MM) {
	const nowFull = new Date(Date.now());

	const nowShort = new Date();
	nowShort.setHours(nowFull.getHours());
	nowShort.setMinutes(nowFull.getMinutes());

	const refTime = new Date();
	refTime.setHours(HH);
	refTime.setMinutes(MM);

	console.log(`nowShort: ${nowShort.getHours()}:${nowShort.getMinutes()}`);
	console.log(`refTime: ${refTime.getHours()}:${refTime.getMinutes()}`);

	const delta = Math.abs(nowShort.getTime() - refTime.getTime());

	const retval = Math.floor(delta / 1000) < (5 * 60);

	console.log(retval);

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
	// const scraper = require('./scrapers.js');
	// const covid = await scraper.getCovidData();
	const wList = await weather.get(Date.now());

	daydate = date.format(new Date(Date.now()), 'DD MMM YYYY, HH:mm');

	// const covidText = 
	//     `**Univ of Utah COVID Cases on ${daydate}** \
	//     \nTotal New Cases:             ${covid.newCases} \
	//     \n7-day Avg New Cases:   ${covid.weeklyAvg}`;

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
        \nTemp (F)\t @ ${tm2_string} ??? ${tm2_temp} \
		\n\t\t\t\t\t\t@ ${tm1_string} ??? ${tm1_temp} \
		\n\t\t\t\t\t\t@ ${tm0_string} ??? ${tm0_temp}
        \nWeather: ${w}`;

	const postText = `**Data for ${courseName}:** \
		\n\
		\n${weatherText}`;

	channels.forEach((cId) => {
		client.channels.fetch(cId)
			.then(channel => channel.send(postText));
	});
}
