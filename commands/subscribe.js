const { SlashCommandBuilder } = require('@discordjs/builders');

// make command available for discord.js
module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribes the current channel to cs3130 project helper'),
    async execute(interaction) {
        await interaction.reply('Subscribed!');
    },
};