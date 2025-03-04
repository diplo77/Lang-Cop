const CONSTANTS = {
    SUPPORTED_LANGUAGES: {
        en: 'English',
        hi: 'Hindi',
        hinglish: 'Hinglish',
        pt: 'Portuguese',
        es: 'Spanish',
        ko: 'Korean',
        de: 'German',
        tr: 'Turkish',
        ur: 'Urdu',
        zh: 'Chinese',
        fr: 'French',
        ar: 'Arabic',
        ja: 'Japanese',
        ru: 'Russian',
        it: 'Italian'
    },

    ERROR_MESSAGES: {
        INVALID_LANGUAGE: 'Invalid language specified',
        PERMISSION_DENIED: 'You do not have permission to use this command',
        INVALID_CHANNEL: 'Invalid channel specified',
        INVALID_ROLE: 'Invalid role specified',
        BOT_PERMISSION_DENIED: 'The bot needs timeout permissions to function properly'
    },

    SUCCESS_MESSAGES: {
        LANGUAGE_BLOCKED: 'Language blocked successfully',
        LANGUAGE_UNBLOCKED: 'Language unblocked successfully',
        SETTINGS_CLEARED: 'Settings cleared successfully',
        STUDY_MODE_SETUP: 'Study mode setup completed'
    }
};

module.exports = { CONSTANTS };