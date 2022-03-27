const scraper = require('../scrapers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const date = require('date-and-time');
const chrono = require('chrono-node');
const dayjs = require('dayjs');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isSameOrAfter);

// make command available for discord.js
module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Gets current and recent weather information from OpenWeather API.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('historical')
                .setDescription('Get historical data')
                .addStringOption(option =>
                    option
                        .setName('datetime')
                        .setDescription('The date and time to query weather for')
                        .setRequired(true))),
    async execute(interaction) {
        var reply;

        if (interaction.options.getSubcommand() === 'historical') {
            const datetimeText = interaction.options.getString('datetime');
            const datetime = chrono.parseDate(datetimeText);
            reply = await getWeatherTextHistorical(datetime);
        } else {
            reply = await getWeatherText();
        }

        await interaction.reply(reply);
    },
};

/**
 * Retrieves weather data and returns message.
 * @async
 * @method
 * @param {number} time - T-0 for weather data
 * @returns {String} Weather data message
 */
async function getWeatherText(time) {

    // if time parameter undefined, use current time
    if (time == undefined) time = Math.floor(Date.now() / 1000);

    // pull city id, API token from env variable
    const token = process.env.OPENWEATHER_TOKEN;
    const cityId = process.env.OPENWEATHER_CITY_ID;

    const data = await scraper.getWeatherData(token, cityId);

    // get current time and temp info
    const tm0 = data.dt;
    const tm0_string = date.format(tm0, 'HH:mm');

    // get date, city, and current nominal weather
    const daydate = date.format(tm0, 'DD MMM YYYY');
    const city = data.city;
    const weathers = data.weather;

    const text = `**${city} Weather on ${daydate}:** \
        \n**Temp (F)**\t@ ${tm0_string} – ${data.temp} \
        \n**Weather**: ${weathers}`;

    return text;
}

async function getWeatherTextHistorical(datetime) {

    if (!datetime || dayjs(datetime).isSameOrAfter(dayjs(), 'millisecond'))
        return getWeatherText();

    // we only have hourly data:
    // round to the nearest hour
    const msPerHr = 60 * 60 * 1000;
    var datetimeRounded = dayjs(Math.round(date.getTime() / msPerHr) * msPerHr);

    // if nearest hour in the future, use last hour
    if (datetimeRounded.isSameOrAfter(dayjs(), 'millisecond'))
        datetimeRounded.subtract(1, 'hour');

    // pull city id, API token from env variable
    const token = process.env.OPENWEATHER_TOKEN;
    const cityId = process.env.OPENWEATHER_CITY_ID;

    const data = await scraper.getWeatherDataHistorical(token, cityId, datetimeRounded.valueOf());

    // get time and temp info
    const tm0 = data.dt;
    const tm0_string = date.format(tm0, 'HH:mm');

    // get date, city, and nominal weather
    const daydate = date.format(tm0, 'DD MMM YYYY');
    const city = data.city;
    const weathers = data.weather;

    const text = `**${city} Weather on ${daydate}:** \
        \n**Temp (F)**\t@ ${tm0_string} – ${data.temp} \
        \n**Weather**: ${weathers}`;

    return text;
}