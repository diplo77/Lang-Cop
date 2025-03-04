const { PermissionsBitField } = require('discord.js');

const requiredPermissions = [
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.ModerateMembers,
    PermissionsBitField.Flags.MoveMembers,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.Connect
];

module.exports = { requiredPermissions };
