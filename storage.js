const fs = require('fs').promises;
const path = require('path');

class Storage {
    constructor() {
        this.blockedLanguages = new Map();
        this.serverBlockedLanguages = new Map();
        this.studyModeSettings = new Map();
        this.lastActivity = new Map();
        this.warnings = new Map();
        this.blacklist = new Map();
        this.exemptions = new Map();
        this.dataDir = path.join(__dirname, '../../data');
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await this.loadData();
        } catch (error) {
            console.error('Error initializing storage:', error);
        }
    }

    async loadData() {
        try {
            // Load blocked languages (channel-specific)
            const blockedLanguagesFile = path.join(this.dataDir, 'blockedLanguages.json');
            const blockedLanguagesData = await fs.readFile(blockedLanguagesFile, 'utf8').catch(() => '{}');
            const blockedLanguagesObj = JSON.parse(blockedLanguagesData);
            this.blockedLanguages = new Map(Object.entries(blockedLanguagesObj).map(([k, v]) => [k, new Set(v)]));

            // Load server-wide blocked languages
            const serverBlockedFile = path.join(this.dataDir, 'serverBlockedLanguages.json');
            const serverBlockedData = await fs.readFile(serverBlockedFile, 'utf8').catch(() => '{}');
            const serverBlockedObj = JSON.parse(serverBlockedData);
            this.serverBlockedLanguages = new Map(Object.entries(serverBlockedObj).map(([k, v]) => [k, new Set(v)]));

            // Load study mode settings
            const studyModeFile = path.join(this.dataDir, 'studyMode.json');
            const studyModeData = await fs.readFile(studyModeFile, 'utf8').catch(() => '{}');
            this.studyModeSettings = new Map(Object.entries(JSON.parse(studyModeData)));

            // Load blacklist
            const blacklistFile = path.join(this.dataDir, 'blacklist.json');
            const blacklistData = await fs.readFile(blacklistFile, 'utf8').catch(() => '{}');
            this.blacklist = new Map(Object.entries(JSON.parse(blacklistData)));

            // Load exemptions
            const exemptionsFile = path.join(this.dataDir, 'exemptions.json');
            const exemptionsData = await fs.readFile(exemptionsFile, 'utf8').catch(() => '{}');
            this.exemptions = new Map(Object.entries(JSON.parse(exemptionsData)));

            console.log('Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async saveData() {
        try {
            // Save blocked languages
            const blockedLanguagesObj = Object.fromEntries(
                Array.from(this.blockedLanguages.entries()).map(([k, v]) => [k, Array.from(v)])
            );
            await fs.writeFile(
                path.join(this.dataDir, 'blockedLanguages.json'),
                JSON.stringify(blockedLanguagesObj, null, 2)
            );

            // Save server-wide blocked languages
            const serverBlockedObj = Object.fromEntries(
                Array.from(this.serverBlockedLanguages.entries()).map(([k, v]) => [k, Array.from(v)])
            );
            await fs.writeFile(
                path.join(this.dataDir, 'serverBlockedLanguages.json'),
                JSON.stringify(serverBlockedObj, null, 2)
            );

            // Save study mode settings
            await fs.writeFile(
                path.join(this.dataDir, 'studyMode.json'),
                JSON.stringify(Object.fromEntries(this.studyModeSettings), null, 2)
            );

            // Save blacklist
            await fs.writeFile(
                path.join(this.dataDir, 'blacklist.json'),
                JSON.stringify(Object.fromEntries(this.blacklist), null, 2)
            );

            // Save exemptions
            await fs.writeFile(
                path.join(this.dataDir, 'exemptions.json'),
                JSON.stringify(Object.fromEntries(this.exemptions), null, 2)
            );
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Server-wide language blocking
    blockServerLanguage(guildId, language) {
        if (!this.serverBlockedLanguages.has(guildId)) {
            this.serverBlockedLanguages.set(guildId, new Set());
        }
        this.serverBlockedLanguages.get(guildId).add(language);
        this.saveData();
    }

    unblockServerLanguage(guildId, language) {
        if (this.serverBlockedLanguages.has(guildId)) {
            this.serverBlockedLanguages.get(guildId).delete(language);
            this.saveData();
        }
    }

    getServerBlockedLanguages(guildId) {
        return Array.from(this.serverBlockedLanguages.get(guildId) || []);
    }

    // Exemptions management
    addExemption(guildId, type, id) {
        if (!this.exemptions.has(guildId)) {
            this.exemptions.set(guildId, {
                channels: new Set(),
                roles: new Set(),
                users: new Set()
            });
        }
        const guildExemptions = this.exemptions.get(guildId);
        const collection = type === 'channel' ? 'channels' : type === 'role' ? 'roles' : 'users';
        if (!(guildExemptions[collection] instanceof Set)) {
            guildExemptions[collection] = new Set();
        }
        guildExemptions[collection].add(id);
        this.saveData();
    }

    removeExemption(guildId, type, id) {
        if (this.exemptions.has(guildId)) {
            const guildExemptions = this.exemptions.get(guildId);
            const collection = type === 'channel' ? 'channels' : type === 'role' ? 'roles' : 'users';
            if (guildExemptions[collection] instanceof Set) {
                guildExemptions[collection].delete(id);
                this.saveData();
            }
        }
    }

    isExempted(guildId, channelId, member) {
        if (!this.exemptions.has(guildId)) return false;
        const guildExemptions = this.exemptions.get(guildId);

        // Initialize Sets if they don't exist
        if (!(guildExemptions.channels instanceof Set)) guildExemptions.channels = new Set();
        if (!(guildExemptions.roles instanceof Set)) guildExemptions.roles = new Set();
        if (!(guildExemptions.users instanceof Set)) guildExemptions.users = new Set();

        // Check if channel is exempted
        if (guildExemptions.channels.has(channelId)) return true;

        // Check if user is exempted
        if (guildExemptions.users.has(member.id)) return true;

        // Check if any of user's roles are exempted
        return member.roles.cache.some(role => guildExemptions.roles.has(role.id));
    }

    // Language management
    blockLanguage(channelId, language) {
        if (!this.blockedLanguages.has(channelId)) {
            this.blockedLanguages.set(channelId, new Set());
        }
        this.blockedLanguages.get(channelId).add(language);
        this.saveData();
    }

    unblockLanguage(channelId, language) {
        if (this.blockedLanguages.has(channelId)) {
            this.blockedLanguages.get(channelId).delete(language);
            this.saveData();
        }
    }

    getBlockedLanguages(channelId) {
        return Array.from(this.blockedLanguages.get(channelId) || []);
    }

    // Warning system
    getWarningCount(guildId, userId, channelId) {
        const key = `${guildId}-${userId}-${channelId}`;
        return this.warnings.get(key) || 0;
    }

    incrementWarningCount(guildId, userId, channelId) {
        const key = `${guildId}-${userId}-${channelId}`;
        this.warnings.set(key, this.getWarningCount(guildId, userId, channelId) + 1);
    }

    resetWarningCount(guildId, userId, channelId) {
        const key = `${guildId}-${userId}-${channelId}`;
        this.warnings.delete(key);
    }

    // Settings management
    clearChannelSettings(channelId) {
        this.blockedLanguages.delete(channelId);
        // Clear warnings for this channel
        for (const [key] of this.warnings) {
            if (key.endsWith(channelId)) {
                this.warnings.delete(key);
            }
        }
        this.saveData();
    }

    clearServerSettings(guildId) {
        // Clear all channel settings for this guild
        for (const [channelId] of this.blockedLanguages) {
            if (channelId.startsWith(guildId)) {
                this.blockedLanguages.delete(channelId);
            }
        }

        // Clear study mode settings
        this.studyModeSettings.delete(guildId);
        this.lastActivity.delete(guildId);

        // Clear warnings for this guild
        for (const [key] of this.warnings) {
            if (key.startsWith(guildId)) {
                this.warnings.delete(key);
            }
        }

        // Clear blacklist for this guild
        this.blacklist.delete(guildId);
        this.exemptions.delete(guildId);

        this.saveData();
    }

    // Study mode
    setStudyMode(guildId, settings) {
        this.studyModeSettings.set(guildId, settings);
        this.saveData();
    }

    getStudyMode(guildId) {
        return this.studyModeSettings.get(guildId);
    }

    updateLastActivity(guildId, userId) {
        if (!this.lastActivity.has(guildId)) {
            this.lastActivity.set(guildId, new Map());
        }
        this.lastActivity.get(guildId).set(userId, Date.now());
    }

    getLastActivity(guildId, userId) {
        return this.lastActivity.get(guildId)?.get(userId) || 0;
    }

    // Blacklist management
    addToBlacklist(guildId, type, id) {
        if (!this.blacklist.has(guildId)) {
            this.blacklist.set(guildId, { roles: new Set(), users: new Set() });
        }
        const guildBlacklist = this.blacklist.get(guildId);
        guildBlacklist[type === 'role' ? 'roles' : 'users'].add(id);
        this.saveData();
    }

    removeFromBlacklist(guildId, type, id) {
        if (this.blacklist.has(guildId)) {
            const guildBlacklist = this.blacklist.get(guildId);
            guildBlacklist[type === 'role' ? 'roles' : 'users'].delete(id);
            this.saveData();
        }
    }

    isBlacklisted(guildId, member) {
        if (!this.blacklist.has(guildId)) return false;
        const guildBlacklist = this.blacklist.get(guildId);

        // Check if user is blacklisted
        if (guildBlacklist.users.has(member.id)) return true;

        // Check if any of user's roles are blacklisted
        return member.roles.cache.some(role => guildBlacklist.roles.has(role.id));
    }
}

module.exports = { Storage };