const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const serverBlacklistCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('exempt-add')
            .setDescription('Add exemption from language blocking')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('channel')
                    .setDescription('Exempt a channel from language blocking')
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('Channel to exempt')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('role')
                    .setDescription('Exempt a role from language blocking')
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('Role to exempt')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('user')
                    .setDescription('Exempt a user from language blocking')
                    .addUserOption(option =>
                        option.setName('user')
                            .setDescription('User to exempt')
                            .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guildId;

            if (subcommand === 'channel') {
                const channel = interaction.options.getChannel('channel');
                storage.addExemption(guildId, 'channel', channel.id);
                await interaction.reply({
                    content: `Added channel ${channel.name} to exemptions`,
                    ephemeral: true
                });
            } else if (subcommand === 'role') {
                const role = interaction.options.getRole('role');
                storage.addExemption(guildId, 'role', role.id);
                await interaction.reply({
                    content: `Added role ${role.name} to exemptions`,
                    ephemeral: true
                });
            } else {
                const user = interaction.options.getUser('user');
                storage.addExemption(guildId, 'user', user.id);
                await interaction.reply({
                    content: `Added user ${user.username} to exemptions`,
                    ephemeral: true
                });
            }
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('exempt-remove')
            .setDescription('Remove exemption from language blocking')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('channel')
                    .setDescription('Remove channel exemption')
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('Channel to remove from exemptions')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('role')
                    .setDescription('Remove role exemption')
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('Role to remove from exemptions')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('user')
                    .setDescription('Remove user exemption')
                    .addUserOption(option =>
                        option.setName('user')
                            .setDescription('User to remove from exemptions')
                            .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guildId;

            if (subcommand === 'channel') {
                const channel = interaction.options.getChannel('channel');
                storage.removeExemption(guildId, 'channel', channel.id);
                await interaction.reply({
                    content: `Removed channel ${channel.name} from exemptions`,
                    ephemeral: true
                });
            } else if (subcommand === 'role') {
                const role = interaction.options.getRole('role');
                storage.removeExemption(guildId, 'role', role.id);
                await interaction.reply({
                    content: `Removed role ${role.name} from exemptions`,
                    ephemeral: true
                });
            } else {
                const user = interaction.options.getUser('user');
                storage.removeExemption(guildId, 'user', user.id);
                await interaction.reply({
                    content: `Removed user ${user.username} from exemptions`,
                    ephemeral: true
                });
            }
        }
    }
];

module.exports = { serverBlacklistCommands };
