const { SlashCommandBuilder } = require('discord.js');

const utilityCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Check if the bot is working'),
        async execute(interaction) {
            const sent = await interaction.reply({ 
                content: 'Pinging...', 
                fetchReply: true 
            });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply(`Pong! Bot latency: ${latency}ms. API Latency: ${interaction.client.ws.ping}ms`);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('show-settings')
            .setDescription('Show all settings for the current channel/server'),
        async execute(interaction, storage) {
            const channelId = interaction.channelId;
            const guildId = interaction.guildId;

            const blockedLanguages = storage.getBlockedLanguages(channelId);
            const studyMode = storage.getStudyMode(guildId);
            const blacklist = storage.blacklist.get(guildId);

            let settingsMessage = '**Current Settings**\n\n';

            // Channel settings
            settingsMessage += '**Channel Settings**\n';
            if (blockedLanguages && blockedLanguages.length > 0) {
                settingsMessage += `Blocked Languages: ${blockedLanguages.join(', ')}\n`;
            } else {
                settingsMessage += 'No languages blocked in this channel\n';
            }

            // Study mode settings
            settingsMessage += '\n**Study Mode Settings**\n';
            if (studyMode) {
                if (studyMode.roleId) {
                    const role = interaction.guild.roles.cache.get(studyMode.roleId);
                    settingsMessage += `Monitored Role: ${role ? role.name : 'Unknown Role'}\n`;
                }
                if (studyMode.userId) {
                    const user = interaction.guild.members.cache.get(studyMode.userId);
                    settingsMessage += `Monitored User: ${user ? user.user.username : 'Unknown User'}\n`;
                }
                settingsMessage += `Destination Channel: ${studyMode.destChannelId}\n`;
                settingsMessage += `Timeout: ${studyMode.timeout} minutes\n`;
            } else {
                settingsMessage += 'Study mode not configured\n';
            }

            // Blacklist settings
            settingsMessage += '\n**Blacklist Settings**\n';
            if (blacklist) {
                const blacklistedRoles = Array.from(blacklist.roles || [])
                    .map(roleId => {
                        const role = interaction.guild.roles.cache.get(roleId);
                        return role ? role.name : 'Unknown Role';
                    });
                const blacklistedUsers = Array.from(blacklist.users || [])
                    .map(userId => {
                        const member = interaction.guild.members.cache.get(userId);
                        return member ? member.user.username : 'Unknown User';
                    });

                if (blacklistedRoles.length > 0) {
                    settingsMessage += `Blacklisted Roles: ${blacklistedRoles.join(', ')}\n`;
                }
                if (blacklistedUsers.length > 0) {
                    settingsMessage += `Blacklisted Users: ${blacklistedUsers.join(', ')}\n`;
                }
                if (blacklistedRoles.length === 0 && blacklistedUsers.length === 0) {
                    settingsMessage += 'No blacklisted roles or users\n';
                }
            } else {
                settingsMessage += 'No blacklist configured\n';
            }

            await interaction.reply({
                content: settingsMessage,
                ephemeral: true
            });
        }
    }
];

module.exports = { utilityCommands };