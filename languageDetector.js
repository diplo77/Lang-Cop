const { CONSTANTS } = require('./constants');

class MessageHandler {
    constructor(storage) {
        this.storage = storage;
        this.warningTemplates = [
            (languageName, emojis) => 
                `${emojis} Hey there, Language Police Officer Lily here! 🎀 I noticed you're using ${languageName}. 
                While I won't take you to language jail this time, some of our friends might feel left out! 
                Could you switch to our server's main language? Pretty pwease? *adjusts police cap* 💝`,

            (languageName, emojis) => 
                `${emojis} *pulls out kawaii handcuffs* OwO what's this? ${languageName} detected! 
                No jail time today, but remember - when everyone can understand each other, 
                the server is more fun! Help me keep the peace? *winks* 💫`,

            (languageName, emojis) => 
                `${emojis} STOP RIGHT THERE! Just kidding~ 😊 But I did catch you using ${languageName}! 
                As your friendly neighborhood language officer, I have to remind you that some friends 
                might feel excluded. Let's keep it inclusive! *twirls baton* ✨`,

            (languageName, emojis) => 
                `${emojis} *sirens flash in pastel colors* Attention please! 🎀 
                This is your cute language enforcement officer speaking! I spotted some ${languageName}! 
                While it's not illegal (*yet* 😉), it would be super sweet if you could use our main language! 
                Don't make me use my special handcuffs! 🌸`
        ];
        this.policeEmojis = ['👮‍♀️', '🚓', '🚨', '🚔', '⚡', '✨', '💝', '🌸', '🎀', '💫'];
    }

    async handleMessage(message) {
        if (message.author.bot) return;

        const channelId = message.channelId;
        const guildId = message.guildId;

        console.log(`Processing message in channel ${message.channel.name} from ${message.author.tag}`);

        // Skip if user/channel/role is exempted
        if (this.storage.isExempted(guildId, channelId, message.member)) {
            console.log('Message is from an exempted user/channel/role, skipping');
            return;
        }

        const blockedLanguages = this.storage.getBlockedLanguages(channelId);
        const serverBlockedLanguages = this.storage.getServerBlockedLanguages(guildId);

        if (!blockedLanguages?.length && !serverBlockedLanguages?.length) {
            console.log('No blocked languages for this channel or server');
            return;
        }

        const detectedLanguage = await this.detectLanguage(message.content);
        console.log(`Message: "${message.content}" - Detected Language: ${detectedLanguage}`);

        // Handle channel-specific blocks (with punishments)
        if (blockedLanguages?.includes(detectedLanguage)) {
            console.log(`Blocked language ${detectedLanguage} detected in channel ${message.channel.name}`);
            const warningCount = this.storage.getWarningCount(message.guildId, message.author.id, channelId);
            const languageName = CONSTANTS.SUPPORTED_LANGUAGES[detectedLanguage] || detectedLanguage;

            if (warningCount === 0) {
                const warningMessage = await message.reply({
                    content: `👮‍♀️ **WARNING** 🚨: ${languageName} is not allowed in this channel. Next violation will result in a timeout. 🚔`,
                    ephemeral: true
                });
                setTimeout(() => {
                    warningMessage.delete().catch(console.error);
                }, 60 * 1000);
                this.storage.incrementWarningCount(message.guildId, message.author.id, channelId);
            } else {
                try {
                    await message.member.timeout(60 * 1000, 'Using blocked language after warning');
                    const timeoutMessage = await message.reply({
                        content: '👮 **TIMEOUT** 🚓: You have been timed out for 1 minute for using a blocked language after being warned. 🚔 👮‍♀️',
                        ephemeral: true
                    });
                    setTimeout(() => {
                        timeoutMessage.delete().catch(console.error);
                    }, 60 * 1000);
                } catch (error) {
                    console.error('Failed to timeout member:', error);
                    await message.reply({
                        content: '⚠️ Warning: Could not apply timeout. Please ensure the bot has proper permissions.',
                        ephemeral: true
                    });
                }
                this.storage.resetWarningCount(message.guildId, message.author.id, channelId);
            }
            await message.delete().catch(console.error);
            return;
        }

        // Handle server-wide blocks (friendly reminders)
        if (serverBlockedLanguages?.includes(detectedLanguage)) {
            console.log(`Server-blocked language ${detectedLanguage} detected, sending friendly reminder`);
            const languageName = CONSTANTS.SUPPORTED_LANGUAGES[detectedLanguage] || detectedLanguage;

            // Get 3 random emojis
            const randomEmojis = this.policeEmojis
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .join(' ');

            // Get random message template
            const randomTemplate = this.warningTemplates[
                Math.floor(Math.random() * this.warningTemplates.length)
            ];

            await message.reply({
                content: randomTemplate(languageName, randomEmojis)
            });
            console.log('Sent friendly reminder about language usage');
        }

        // Update last activity timestamp for study mode
        this.storage.updateLastActivity(message.guildId, message.author.id);
    }

    async detectLanguage(text) {
        // Check for Devanagari script (Hindi)
        if (/[\u0900-\u097F]/.test(text)) {
            console.log('Detected Hindi script in text:', text);
            return 'hi';
        }

        // Check for Hinglish patterns
        if (this.isHinglish(text)) {
            console.log('Detected Hinglish pattern in text:', text);
            return 'hinglish';
        }

        try {
            // Use franc-min for other languages
            const franc = await import('franc-min');
            const detectedLang = franc.default(text);
            console.log('Franc detected language:', detectedLang, 'for text:', text);
            return detectedLang;
        } catch (error) {
            console.error('Error detecting language:', error);
            return 'und'; // Return 'undefined' if detection fails
        }
    }

    isHinglish(text) {
        // Enhanced Hinglish detection patterns
        const hinglishPatterns = [
            /kya|hai|nahi|main|tum|aap|kaise|ho|theek|accha/i,
            /kar(na|ne|ta|ti|te)|jaa?(\s)?raha?/i,
            /matlab|fir|lekin|par|aur|mein|kuch|bahut/i,
            /dekho|suno|bolo|samajh|pata|dost|yaar|bhai/i,
            /dinner|lunch|breakfast|time|study|class/i, // Common English words used in Hinglish
            /\b(hai|hain|tha|thi|the|ho|hona|huwa|huyi|hue)\b/i, // Common Hindi verbs in Roman
            /\b(me|ko|ka|ki|ke|se|par|pe|tak|bhi)\b/i // Common Hindi postpositions
        ];

        // Count matching patterns
        const matchingPatterns = hinglishPatterns.filter(pattern => pattern.test(text));
        console.log('Hinglish patterns matched:', matchingPatterns.length, 'in text:', text);

        // Consider text as Hinglish if it matches at least 2 patterns
        return matchingPatterns.length >= 2;
    }
}

module.exports = { MessageHandler };