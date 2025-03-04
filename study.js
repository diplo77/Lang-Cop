const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function startStudyModeMonitoring(client, storage, guildId) {
    console.log(`Starting study mode monitoring for guild ${guildId}`);

    setInterval(async () => {
        const settings = storage.getStudyMode(guildId);
        if (!settings) {
            console.log(`No study mode settings found for guild ${guildId}`);
            return;
        }

        const guild = await client.guilds.fetch(guildId);
        if (!guild) {
            console.log(`Could not fetch guild ${guildId}`);
            return;
        }

        // Check all voice channels in the guild
        for (const [channelId, channel] of guild.channels.cache) {
            if (!channel.isVoiceBased() || channelId === settings.destChannelId) continue;
            console.log(`Checking voice channel: ${channel.name} (${channelId})`);

            for (const [memberId, member] of channel.members) {
                // Skip blacklisted members
                if (storage.isBlacklisted(guildId, member)) {
                    console.log(`Skipping blacklisted member: ${member.user.tag}`);
                    continue;
                }

                const shouldMonitor = (settings.roleId && member.roles.cache.has(settings.roleId)) ||
                                    (settings.userId && memberId === settings.userId);

                if (shouldMonitor) {
                    const lastActivity = storage.getLastActivity(guildId, memberId);
                    const inactiveTime = Date.now() - lastActivity;
                    console.log(`Member ${member.user.tag} inactive for ${Math.floor(inactiveTime/60000)} minutes`);

                    if (inactiveTime >= settings.timeout * 60 * 1000) {
                        // Move user without warning
                        try {
                            await member.voice.setChannel(settings.destChannelId);
                            console.log(`Moved ${member.user.tag} to study channel`);
                        } catch (error) {
                            console.error('Could not move user:', error);
                        }
                    }
                }
            }
        }
    }, 60000); // Check every minute
}

const studyCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('setup-study-mode')
            .setDescription('Setup study mode for voice channels')
            .addChannelOption(option =>
                option.setName('destination')
                    .setDescription('Destination voice channel')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('timeout')
                    .setDescription('Timeout in minutes')
                    .setRequired(true))
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('Role to monitor (optional)')
                    .setRequired(false))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to monitor (optional)')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const role = interaction.options.getRole('role');
            const user = interaction.options.getUser('user');
            const destChannel = interaction.options.getChannel('destination');
            const timeout = interaction.options.getInteger('timeout');

            if (!role && !user) {
                await interaction.reply({
                    content: 'You must specify either a role or a user to monitor.',
                    ephemeral: true
                });
                return;
            }

            if (!destChannel.isVoiceBased()) {
                await interaction.reply({
                    content: 'The destination channel must be a voice channel.',
                    ephemeral: true
                });
                return;
            }

            storage.setStudyMode(interaction.guildId, {
                roleId: role?.id,
                userId: user?.id,
                destChannelId: destChannel.id,
                timeout: timeout
            });

            // Start monitoring immediately
            startStudyModeMonitoring(interaction.client, storage, interaction.guildId);

            let response = `Study mode setup complete. `;
            if (role) {
                response += `Users with ${role.name} role `;
            }
            if (user) {
                response += `${user.username} `;
            }
            response += `will be moved after ${timeout} minutes of inactivity.`;

            await interaction.reply({
                content: response,
                ephemeral: true
            });
        }
    }
];

module.exports = { studyCommands, startStudyModeMonitoring };