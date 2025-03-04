const keepAlive = require('./keepAlive');
keepAlive();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { languageCommands } = require('./commands/language');
const { settingsCommands } = require('./commands/settings');
const { studyCommands, startStudyModeMonitoring } = require('./commands/study');
const { utilityCommands } = require('./commands/utility');
const { blacklistCommands } = require('./commands/blacklist');
const { MessageHandler } = require('./utils/languageDetector');
const { Storage } = require('./utils/storage');
const { requiredPermissions } = require('./utils/permissions');
const { serverFriendlyLanguageCommands } = require('./commands/serverFriendlyLanguage');
const { serverBlacklistCommands } = require('./commands/serverBlacklist');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const storage = new Storage();

// Register commands
[
    ...languageCommands,
    ...settingsCommands,
    ...studyCommands,
    ...utilityCommands,
    ...blacklistCommands,
    ...serverFriendlyLanguageCommands,
    ...serverBlacklistCommands
].forEach(command => {
    client.commands.set(command.data.name, command);
    console.log(`Registered command: ${command.data.name}`);
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Generate and log invite link with required permissions
    const inviteLink = client.generateInvite({
        scopes: ['bot', 'applications.commands'],
        permissions: requiredPermissions
    });
    console.log('Invite Link:', inviteLink);

    // Log the number of servers the bot is in
    console.log(`Bot is in ${client.guilds.cache.size} servers`);

    // Start study mode monitoring for all guilds
    client.guilds.cache.forEach(guild => {
        const settings = storage.getStudyMode(guild.id);
        if (settings) {
            console.log(`Starting study mode monitoring for guild ${guild.id}`);
            startStudyModeMonitoring(client, storage, guild.id);
        }
    });

    // Heartbeat logging
    setInterval(() => {
        console.log(`[Heartbeat] Bot is alive - Ping: ${client.ws.ping}ms`);
        console.log(`[Heartbeat] Connected to ${client.guilds.cache.size} servers`);
    }, 60000); // Log every minute
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        console.log(`Executing command: ${interaction.commandName} by ${interaction.user.tag}`);
        await command.execute(interaction, storage);
    } catch (error) {
        console.error('Command execution error:', error);
        await interaction.reply({
            content: 'There was an error executing this command!',
            ephemeral: true
        }).catch(console.error);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    try {
        console.log(`Processing message in channel ${message.channel.name} from ${message.author.tag}`);
        const messageHandler = new MessageHandler(storage);
        await messageHandler.handleMessage(message);
    } catch (error) {
        console.error('Message handling error:', error);
    }
});

// Check bot permissions when joining a new guild
client.on('guildCreate', async guild => {
    console.log(`Joined new guild: ${guild.name}`);
    const botMember = guild.members.cache.get(client.user.id);
    const missingPermissions = botMember.permissions.missing(requiredPermissions);

    if (missingPermissions.length > 0) {
        try {
            const owner = await guild.fetchOwner();
            await owner.send(`Warning: The bot is missing the following required permissions: ${missingPermissions.join(', ')}. Please ensure these permissions are granted for proper functionality.`);
            console.log(`Sent permission warning to ${guild.name} owner`);
        } catch (error) {
            console.error('Could not send permission warning to guild owner:', error);
        }
    }
});

// Handle disconnections and errors
client.on('disconnect', () => {
    console.error('Bot disconnected! Attempting to reconnect...');
});

client.on('error', error => {
    console.error('Discord client error:', error);
});

// Error handling for unhandled rejections and exceptions
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    // Attempt to reconnect if the client is still running
    if (client.isReady()) {
        console.log('Attempting to recover from uncaught exception...');
    }
});

const TOKEN = process.env.DISCORD_TOKEN;
client.login(TOKEN).catch(error => {
    console.error('Failed to login:', error);
});