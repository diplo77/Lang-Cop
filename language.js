const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CONSTANTS } = require('../utils/constants');

const languageCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('block-language')
            .setDescription('Block languages in the current channel')
            .addStringOption(option =>
                option.setName('languages')
                    .setDescription('Languages to block (space-separated)')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const languages = interaction.options.getString('languages').split(/\s+/);
            const channelId = interaction.channelId;
            const blockedLanguages = [];

            for (const language of languages) {
                if (CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]) {
                    storage.blockLanguage(channelId, language.trim());
                    blockedLanguages.push(CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]);
                }
            }

            await interaction.reply({
                content: `Blocked the following languages in this channel: ${blockedLanguages.join(', ')}`,
                ephemeral: true
            });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('unblock-language')
            .setDescription('Unblock languages in the current channel')
            .addStringOption(option =>
                option.setName('languages')
                    .setDescription('Languages to unblock (space-separated)')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const languages = interaction.options.getString('languages').split(/\s+/);
            const channelId = interaction.channelId;
            const unblockedLanguages = [];

            for (const language of languages) {
                if (CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]) {
                    storage.unblockLanguage(channelId, language.trim());
                    unblockedLanguages.push(CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]);
                }
            }

            await interaction.reply({
                content: `Unblocked the following languages in this channel: ${unblockedLanguages.join(', ')}`,
                ephemeral: true
            });
        }
    }
];

module.exports = { languageCommands };