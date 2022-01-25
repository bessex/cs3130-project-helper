const scraper = require('../scrapers.js');
// configure env variables to use later
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');

const axios = require('axios');
const date = require('date-and-time');

// make command available for discord.js
module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Gets current and recent weather information from OpenWeather API.'),
    async execute(interaction) {
        const reply = await getWeatherText();
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

    data = await scraper.getWeatherData(token, cityId);
    
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