const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const blacklistCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('blacklist-add')
            .setDescription('Add a role or user to the blacklist')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('role')
                    .setDescription('Add a role to the blacklist')
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('Role to blacklist')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('user')
                    .setDescription('Add a user to the blacklist')
                    .addUserOption(option =>
                        option.setName('user')
                            .setDescription('User to blacklist')
                            .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guildId;

            if (subcommand === 'role') {
                const role = interaction.options.getRole('role');
                storage.addToBlacklist(guildId, 'role', role.id);
                await interaction.reply({
                    content: `Added role ${role.name} to the blacklist`,
                    ephemeral: true
                });
            } else {
                const user = interaction.options.getUser('user');
                storage.addToBlacklist(guildId, 'user', user.id);
                await interaction.reply({
                    content: `Added user ${user.username} to the blacklist`,
                    ephemeral: true
                });
            }
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('blacklist-remove')
            .setDescription('Remove a role or user from the blacklist')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('role')
                    .setDescription('Remove a role from the blacklist')
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('Role to remove')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('user')
                    .setDescription('Remove a user from the blacklist')
                    .addUserOption(option =>
                        option.setName('user')
                            .setDescription('User to remove')
                            .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, storage) {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guildId;

            if (subcommand === 'role') {
                const role = interaction.options.getRole('role');
                storage.removeFromBlacklist(guildId, 'role', role.id);
                await interaction.reply({
                    content: `Removed role ${role.name} from the blacklist`,
                    ephemeral: true
                });
            } else {
                const user = interaction.options.getUser('user');
                storage.removeFromBlacklist(guildId, 'user', user.id);
                await interaction.reply({
                    content: `Removed user ${user.username} from the blacklist`,
                    ephemeral: true
                });
            }
        }
    }
];

module.exports = { blacklistCommands };
