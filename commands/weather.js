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

    // request current JSON from API
    const nowJson = await axios.get(`https://api.openweathermap.org/data/2.5/weather?id=${cityId}&dt=${time}&APPID=${token}`)
                            .then((response) => response.data)
                            .catch(console.error);
    
    const tMinus1hr = time - (1 * 60 * 60);
    const tMinus2hr = time - (2 * 60 * 60);
    const tMinus3hr = time - (3 * 60 * 60);

    // request historical JSON from API
    const historicalJson = await axios.get(`http://history.openweathermap.org/data/2.5/history/city?id=${cityId}&type=hour&start=${tMinus3hr}&end=${time}&appid=${token}`)
                            .then((response) => response.data)
                            .catch(console.error);

    // initialize saved datapoints as first array item
    // weather data for T-1hr
    var tm1_data = historicalJson.list[0];
    // weather data for T-2hr
    var tm2_data = historicalJson.list[0];

    // save datapoints closest to the desired time
    historicalJson.list.forEach(element => {
        const bestTimeDelta1 = Math.abs(tMinus1hr - tm1_data.dt);
        const currentTimeDelta1 = Math.abs(tMinus1hr - element.dt);

        if (currentTimeDelta1 < bestTimeDelta1) tm1_data = element;

        const bestTimeDelta2 = Math.abs(tMinus2hr - tm2_data.dt);
        const currentTimeDelta2 = Math.abs(tMinus2hr - element.dt);

        if (currentTimeDelta2 < bestTimeDelta2) tm2_data = element;
    });
    
    // get current time and temp info
    const tm0 = new Date(nowJson.dt * 1000);
    const tm0_string = date.format(tm0, 'HH:mm');
    const tm0_temp = (((nowJson.main.temp - 273) * 9/5) + 32).toFixed(2);

    // get T-1hr time and temp info
    const tm1 = new Date(tm1_data.dt * 1000);
    const tm1_string = date.format(tm1, 'HH:mm');
    const tm1_temp = (((tm1_data.main.temp - 273) * 9/5) + 32).toFixed(2);

    // get T-2hr time and temp info
    const tm2 = new Date(tm2_data.dt * 1000);
    const tm2_string = date.format(tm2, 'HH:mm');
    const tm2_temp = (((tm2_data.main.temp - 273) * 9/5) + 32).toFixed(2);

    // get date, city, and current nominal weather
    const daydate = date.format(tm0, 'DD MMM YYYY');
    const city = nowJson.name;
    const weathers = Array.from(nowJson.weather, w => w.description).join(', ');

    const text = `**${city} Weather on ${daydate}:** \
        \n**Temp (F)**\t@ ${tm0_string} – ${tm0_temp} \
        \n\t\t\t\t\t\t@ ${tm1_string} – ${tm1_temp} \
        \n\t\t\t\t\t\t@ ${tm2_string} – ${tm2_temp} \
        \n**Weather**: ${weathers}`;

    return text;
}