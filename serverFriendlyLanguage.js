const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { CONSTANTS } = require('../utils/constants');

const serverFriendlyLanguageCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('friendly-block-language')
            .setDescription('Block languages server-wide (friendly warnings only)')
            .addStringOption(option =>
                option.setName('languages')
                    .setDescription('Languages to block (space-separated)')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const languages = interaction.options.getString('languages').split(/\s+/);
            const guildId = interaction.guildId;
            const blockedLanguages = [];
            const languageNames = [];

            for (const language of languages) {
                if (CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]) {
                    storage.blockServerLanguage(guildId, language.trim());
                    blockedLanguages.push(language.trim());
                    languageNames.push(CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]);
                }
            }

            await interaction.reply({
                content: `Enabled friendly reminders for the following languages server-wide: ${languageNames.join(', ')}. Channel-specific blocks will take precedence.`,
                ephemeral: true
            });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('friendly-unblock-language')
            .setDescription('Unblock languages server-wide')
            .addStringOption(option =>
                option.setName('languages')
                    .setDescription('Languages to unblock (space-separated)')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const languages = interaction.options.getString('languages').split(/\s+/);
            const guildId = interaction.guildId;
            const unblockedLanguages = [];

            for (const language of languages) {
                if (CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]) {
                    storage.unblockServerLanguage(guildId, language.trim());
                    unblockedLanguages.push(CONSTANTS.SUPPORTED_LANGUAGES[language.trim()]);
                }
            }

            await interaction.reply({
                content: `Disabled friendly reminders for the following languages server-wide: ${unblockedLanguages.join(', ')}`,
                ephemeral: true
            });
        }
    }
];

module.exports = { serverFriendlyLanguageCommands };
