const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const settingsCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('clear-channel-settings')
            .setDescription('Clear all settings for the current channel')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const channelId = interaction.channelId;

            storage.clearChannelSettings(channelId);

            await interaction.reply({
                content: 'Cleared all settings for this channel',
                ephemeral: true
            });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('clear-server-settings')
            .setDescription('Clear all settings for the entire server')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const guildId = interaction.guildId;

            storage.clearServerSettings(guildId);

            await interaction.reply({
                content: 'Cleared all settings for this server',
                ephemeral: true
            });
        }
    }
];

module.exports = { settingsCommands };