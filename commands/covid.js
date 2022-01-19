const axios = require('axios');
const date = require('date-and-time');
const jsdom = require('jsdom')

const { JSDOM } = jsdom;
const { SlashCommandBuilder } = require('@discordjs/builders');

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
    const html = await axios({
                            method: 'get',
                            url: 'https://coronavirus.utah.edu', 
                            responseType: 'document',
                        })
                            .then((response) => response.data)
                            .catch(console.error);

    // convert html to DOM document
    const document = new JSDOM(html).window.document;

    // totals are on row 5 of data table
    const totals = document.getElementsByClassName('row-5 odd')[0].cells

    // row 5 cell 1 is new cases total
    const newCases = totals[1].textContent;

    // row 5 cell 2 is weekly avg new cases total
    const weekAvgCases = totals[2].textContent;

    const now = date.format(new Date(Date.now()), 'DD MMM YYYY, HH:mm');
    const text = `**Univ of Utah COVID Cases on ${now}** \
        \n**Total New Cases**:\t\t\t\t${newCases} \
        \n**7-day Avg New Cases**:\t${weekAvgCases}`;

    return text;
}