const { REST, Routes } = require('discord.js');
const { languageCommands } = require('./commands/language');
const { settingsCommands } = require('./commands/settings');
const { studyCommands } = require('./commands/study');
const { utilityCommands } = require('./commands/utility');
const { blacklistCommands } = require('./commands/blacklist');
const { serverFriendlyLanguageCommands } = require('./commands/serverFriendlyLanguage');
const { serverBlacklistCommands } = require('./commands/serverBlacklist');

const commands = [];
[
    ...languageCommands,
    ...settingsCommands,
    ...studyCommands,
    ...utilityCommands,
    ...blacklistCommands,
    ...serverFriendlyLanguageCommands,
    ...serverBlacklistCommands
].forEach(command => {
    commands.push(command.data.toJSON());
});

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();