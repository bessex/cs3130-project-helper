const scraper = require('../scrapers.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const date = require('date-and-time');

// make command available for discord.js
module.exports = {
    data: new SlashCommandBuilder()
        .setName('covid')
        .setDescription('Gets current COVID case numbers at the University of Utah.'),
    async execute(interaction) {
        const reply = await getCovidText();
        await interaction.reply(reply);
    },
};

/**
 * Gets latest COVID info message
 * @method
 * @async
 * @returns {String} COVID info message
 */
async function getCovidText() {
    const data = await scraper.getCovidData();

    const daydate = date.format(new Date(data.dt), 'DD MMM YYYY, HH:mm');

    const text = 
        `**Univ of Utah COVID Cases on ${daydate}** \
        \n**Total New Cases**:             ${data.newCases} \
        \n**7-day Avg New Cases**:   ${data.weeklyAvg}`;

    return text;
}