process.env.FFMPEG_PATH = 'C:\\ffmpeg\\bin\\ffmpeg.exe'
process.env.PATH = 'C:\\ffmpeg\\bin;' + process.env.PATH
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const yts = require('yt-search')
const axios = require('axios')
const ffmpeg = require('fluent-ffmpeg')

const fs = require('fs')
const path = require('path')


ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe')


const SERPER_KEY = "TU_KEY_SERPER"
const GEMINI_KEY = "TU_KEY_GEMINI"

const prefixes = ['!', '.', '#', ]

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕮𝖔𝖓𝖋𝖎𝖌𝖚𝖗𝖆𝖈𝖎𝖔𝖓 𝕲𝖑𝖔𝖇𝖆𝖑
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

const config = {
    botName: "𝓜𝓲𝓼𝓪",
    ownerNumber: ["18297677527"],
    premiumUsers: [],
    menuBanner: "https://i.pinimg.com/1200x/e2/9b/10/e29b10c1483f398087db7df96dbe6e82.jpg",
    useLocalBanner: true,
    localBannerPath: "./assets/banner_menu.png",
    externalAd: {
        title: "𝓜𝓲𝓼𝓪 𝕭𝖔𝖙 ꕤ 𝕻𝖗𝖊𝖒𝖎𝖚𝖒",
        body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝓜𝓲𝓼𝓪 ♡ ✨",
        thumbnailUrl: "blob:https://web.whatsapp.com/1a28e65d-35f6-46fa-b160-59028af6c7c6",
        sourceUrl: "https://github.com/yannielmedrano1-sys/-Bot",
        mediaUrl: "https://github.com/yannielmedrano1-sys/-Bot",
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
    }
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕾𝖎𝖘𝖙𝖊𝖒𝖆 𝖉𝖊 𝕯𝖆𝖙𝖔𝖘
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

const groupData = {}
const mutedUsers = {}
const userData = {}
const chatData = {}
const commandCount = {}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕾𝖎𝖘𝖙𝖊𝖒𝖆 𝖉𝖊 𝖀𝖘𝖚𝖆𝖗𝖎𝖔𝖘
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

function getUserData(userId) {
    if (!userData[userId]) {
        userData[userId] = {
            name: "",
            exp: 0,
            coin: 0,
            level: 0,
            premium: false,
            premiumTime: 0,
            banned: false,
            bannedReason: "",
            commands: 0,
            warn: 0
        }
    }
    return userData[userId]
}

function getChatData(chatId) {
    if (!chatData[chatId]) {
        chatData[chatId] = {
            isBanned: false,
            isMute: false,
            welcome: false,
            bye: false,
            welcomeMsg: "¡Bienvenido @user a @group! 🎉",
            byeMsg: "Adiós @user, te extrañaremos. 👋",
            antiLink: false,
            modoadmin: false
        }
    }
    return chatData[chatId]
}

function getGroupData(groupId) {
    if (!groupData[groupId]) {
        groupData[groupId] = {
            welcome: false,
            bye: false,
            welcomeMsg: "¡Bienvenido @user a @group! 🎉",
            byeMsg: "Adiós @user, te extrañaremos. 👋",
            warns: {},
            warnLimit: 3
        }
    }
    return groupData[groupId]
}

function getMutedUsers(groupId) {
    if (!mutedUsers[groupId]) {
        mutedUsers[groupId] = {}
    }
    return mutedUsers[groupId]
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕾𝖎𝖘𝖙𝖊𝖒𝖆 𝖉𝖊 𝕻𝖊𝖗𝖒𝖎𝖘𝖔𝖘
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

function isOwner(userId) {
    const cleanId = userId.replace("@c.us", "").replace("@s.whatsapp.net", "")
    return config.ownerNumber.includes(cleanId) || config.ownerNumber.includes(userId)
}

function isROwner(userId, isFromMe) {
    return isOwner(userId) || isFromMe
}

function isPremium(userId) {
    if (isOwner(userId)) return true
    const cleanId = userId.replace("@c.us", "").replace("@s.whatsapp.net", "")
    if (config.premiumUsers.includes(userId) || config.premiumUsers.includes(cleanId)) return true
    const user = getUserData(userId)
    return user.premium && (user.premiumTime === 0 || user.premiumTime > Date.now())
}

function isUserBanned(userId) {
    const user = getUserData(userId)
    return user.banned && !isOwner(userId)
}

function isChatBanned(chatId) {
    const chat = getChatData(chatId)
    return chat.isBanned
}

async function getGroupChat(msg) {
    try {
        const chat = await msg.getChat()
        if (!chat.isGroup) return null
        if (!chat.participants || chat.participants.length === 0) {
            const reloaded = await client.getChatById(msg.from)
            return reloaded
        }
        return chat
    } catch (err) {
        console.log("Error obteniendo chat:", err.message)
        try {
            return await client.getChatById(msg.from)
        } catch {
            return null
        }
    }
}

async function isAdmin(chat, userId) {
    try {
        if (!chat || !chat.participants) return false
        const participant = chat.participants.find(p => {
            return p.id._serialized === userId ||
                   p.id.user === userId.replace("@c.us", "").replace("@s.whatsapp.net", "")
        })
        if (!participant) return false
        return participant.isAdmin || participant.isSuperAdmin || false
    } catch (err) {
        console.log("Error checking admin:", err.message)
        return false
    }
}

async function isSuperAdmin(chat, userId) {
    try {
        if (!chat || !chat.participants) return false
        const participant = chat.participants.find(p => {
            return p.id._serialized === userId ||
                   p.id.user === userId.replace("@c.us", "").replace("@s.whatsapp.net", "")
        })
        return participant ? (participant.isSuperAdmin || false) : false
    } catch {
        return false
    }
}

async function isBotAdmin(chat) {
    try {
        if (!chat || !chat.participants) return false
        const botId = client.info.wid._serialized
        const participant = chat.participants.find(p => {
            return p.id._serialized === botId ||
                   p.id.user === client.info.wid.user
        })
        if (!participant) return false
        return participant.isAdmin || participant.isSuperAdmin || false
    } catch (err) {
        console.log("Error checking bot admin:", err.message)
        return false
    }
}

function getRealSender(msg) {
    if (msg.from.includes("@g.us")) {
        return msg.author || msg.from
    }
    return msg.from
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕾𝖎𝖘𝖙𝖊𝖒𝖆 𝖉𝖊 𝕱𝖆𝖑𝖑𝖔𝖘
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

const failMessages = {
    owner: "⊹₊ ˚‧︵‿₊୨ 𝙰𝙲𝙲𝙴𝚂𝚂 𝙳𝙴𝙽𝙸𝙴𝙳 ୧₊‿︵‧ ˚ ₊⊹\n\n🔒 ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ᴇs sᴏʟᴏ ᴘᴀʀᴀ ᴇʟ *Owner* ᴅᴇʟ ʙᴏᴛ.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡",
    premium: "⊹₊ ˚‧︵‿₊୨ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ୧₊‿︵‧ ˚ ₊⊹\n\n💎 ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ᴇs sᴏʟᴏ ᴘᴀʀᴀ ᴜsᴜᴀʀɪᴏs *Premium*.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡",
    group: "⊹₊ ˚‧︵‿₊୨ 𝙶𝚁𝚄𝙿𝙾 ୧₊‿︵‧ ˚ ₊⊹\n\n👥 ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ꜰᴜɴᴄɪᴏɴᴀ ᴇɴ *ɢʀᴜᴘᴏs*.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡",
    admin: "⊹₊ ˚‧︵‿₊୨ 𝙰𝙳𝙼𝙸𝙽 ୧₊‿︵‧ ˚ ₊⊹\n\n🛡️ ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ᴇs sᴏʟᴏ ᴘᴀʀᴀ *Admins* ᴅᴇʟ ɢʀᴜᴘᴏ.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡",
    botAdmin: "⊹₊ ˚‧︵‿₊୨ 𝙱𝙾𝚃 𝙰𝙳𝙼𝙸𝙽 ୧₊‿︵‧ ˚ ₊⊹\n\n🤖 ɴᴇᴄᴇsɪᴛᴏ sᴇʀ *ᴀᴅᴍɪɴ* ᴘᴀʀᴀ ᴇᴊᴇᴄᴜᴛᴀʀ ᴇsᴛᴏ.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡",
    banned: "⊹₊ ˚‧︵‿₊୨ 𝙱𝙰𝙽𝙽𝙴𝙳 ୧₊‿︵‧ ˚ ₊⊹\n\n🚫 ᴇsᴛᴀs *ʙᴀɴᴇᴀᴅᴏ* ᴅᴇʟ ʙᴏᴛ.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡",
    chatBanned: "⊹₊ ˚‧︵‿₊୨ 𝙲𝙷𝙰𝚃 𝙱𝙰𝙽𝙽𝙴𝙳 ୧₊‿︵‧ ˚ ₊⊹\n\n🚫 ᴇsᴛᴇ ᴄʜᴀᴛ ᴇsᴛᴀ *ʙᴀɴᴇᴀᴅᴏ*.\nᴄᴏɴᴛᴀᴄᴛᴀ ᴀʟ ᴏᴡɴᴇʀ.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡"
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕳𝖊𝖑𝖕𝖊𝖗: 𝕺𝖇𝖙𝖊𝖓𝖊𝖗 𝕿𝖆𝖗𝖌𝖊𝖙
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

async function getTarget(msg) {
    if (msg.mentionedIds && msg.mentionedIds.length > 0) {
        return msg.mentionedIds[0]
    }
    if (msg.hasQuotedMsg) {
        try {
            const quoted = await msg.getQuotedMessage()
            return quoted.author || quoted.from
        } catch {
            return null
        }
    }
    return null
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕰𝖝𝖙𝖊𝖗𝖓𝖆𝖑 𝕬𝖉 𝕾𝖞𝖘𝖙𝖊𝖒
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

async function sendWithExternalAd(chatId, text, quotedMsg = null, mentions = []) {
    try {
        const rawClient = client.pupPage
        const adPayload = {
            title: config.externalAd.title,
            body: config.externalAd.body,
            thumbnailUrl: config.externalAd.thumbnailUrl,
            sourceUrl: config.externalAd.sourceUrl,
            mediaUrl: config.externalAd.mediaUrl || config.externalAd.sourceUrl,
            mediaType: config.externalAd.mediaType || 1,
            showAdAttribution: config.externalAd.showAdAttribution !== false,
            renderLargerThumbnail: config.externalAd.renderLargerThumbnail !== false
        }
        const result = await rawClient.evaluate(async (chatId, text, ad) => {
            const store = window.Store
            if (!store) return false
            try {
                const chat = await store.Chat.get(chatId)
                if (!chat) return false
                const msg = {
                    body: text, type: 'chat', subtype: null,
                    ctwaContext: {
                        sourceUrl: ad.sourceUrl, thumbnail: ad.thumbnailUrl, thumbnailUrl: ad.thumbnailUrl,
                        title: ad.title, description: ad.body, mediaType: ad.mediaType, mediaUrl: ad.mediaUrl,
                        isSuspiciousLink: false, showAdAttribution: ad.showAdAttribution, renderLargerThumbnail: ad.renderLargerThumbnail
                    }
                }
                await chat.sendMessage(msg)
                return true
            } catch (e) { return false }
        }, chatId, text, adPayload)
        if (!result) {
            const textWithLink = `${text}\n\n🔗 ${config.externalAd.sourceUrl}`
            await client.sendMessage(chatId, textWithLink, { linkPreview: true, mentions })
        }
        return true
    } catch (err) {
        console.log("ᴇxᴛᴇʀɴᴀʟ ᴀᴅ ꜰᴀʟʟʙᴀᴄᴋ:", err.message)
        await client.sendMessage(chatId, text, { mentions })
        return false
    }
}

async function sendExternalAdMessage(chatId, text, mentions = []) {
    try {
        const msg = await client.sendMessage(chatId, text, {
            mentions: mentions,
            extra: {
                contextInfo: {
                    externalAdReply: {
                        title: config.externalAd.title, body: config.externalAd.body,
                        thumbnailUrl: config.externalAd.thumbnailUrl, sourceUrl: config.externalAd.sourceUrl,
                        mediaUrl: config.externalAd.mediaUrl || config.externalAd.sourceUrl,
                        mediaType: config.externalAd.mediaType || 1,
                        showAdAttribution: config.externalAd.showAdAttribution !== false,
                        renderLargerThumbnail: config.externalAd.renderLargerThumbnail !== false
                    }
                }
            }
        })
        return msg
    } catch (err) {
        console.log("ᴇxᴛᴇʀɴᴀʟ ᴀᴅ ᴍᴇᴛʜᴏᴅ 2:", err.message)
        try { return await injectExternalAd(chatId, text, mentions) }
        catch { return await client.sendMessage(chatId, text, { mentions }) }
    }
}

async function injectExternalAd(chatId, text, mentions = []) {
    try {
        const page = client.pupPage
        const sent = await page.evaluate(async (data) => {
            try {
                const { chatId, text, ad } = data
                if (window.Store && window.Store.Chat) {
                    const chat = await window.Store.Chat.get(chatId)
                    if (!chat) return false
                    const linkPreview = {
                        canonical: ad.sourceUrl, matchedText: ad.sourceUrl, richPreviewType: 0,
                        thumbnail: ad.thumbnailUrl, title: ad.title, description: ad.body, doNotPlayInline: true
                    }
                    const extendedMsg = {
                        contextInfo: {
                            externalAdReply: {
                                title: ad.title, body: ad.body, thumbnailUrl: ad.thumbnailUrl,
                                sourceUrl: ad.sourceUrl, mediaUrl: ad.mediaUrl, mediaType: ad.mediaType,
                                showAdAttribution: ad.showAdAttribution, renderLargerThumbnail: ad.renderLargerThumbnail
                            }
                        }
                    }
                    await chat.sendMessage(text, { linkPreview, ...extendedMsg })
                    return true
                }
                return false
            } catch (e) { return false }
        }, {
            chatId, text,
            ad: {
                title: config.externalAd.title, body: config.externalAd.body,
                thumbnailUrl: config.externalAd.thumbnailUrl, sourceUrl: config.externalAd.sourceUrl,
                mediaUrl: config.externalAd.mediaUrl || config.externalAd.sourceUrl,
                mediaType: config.externalAd.mediaType || 1,
                showAdAttribution: config.externalAd.showAdAttribution !== false,
                renderLargerThumbnail: config.externalAd.renderLargerThumbnail !== false
            }
        })
        if (sent) return true
        return await client.sendMessage(chatId, `${text}\n\n🔗 ${config.externalAd.sourceUrl}`, { linkPreview: true, mentions })
    } catch (err) {
        return await client.sendMessage(chatId, text, { mentions })
    }
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕮𝖑𝖎𝖊𝖓𝖙 𝕾𝖊𝖙𝖚𝖕
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: 'new',
        handleSIGINT: false,
        args: [
            '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
            '--disable-gpu', '--disable-web-resources', '--disable-default-apps',
            '--disable-extensions', '--disable-plugins', '--disable-background-networking',
            '--disable-sync', '--disable-breakpad', '--disable-client-side-phishing-detection',
            '--disable-component-extensions-with-background-pages', '--disable-hang-monitor',
            '--disable-ipc-flooding-protection', '--disable-popup-blocking',
            '--disable-prompt-on-repost', '--disable-renderer-backgrounding',
            '--enable-automation', '--metrics-recording-only', '--mute-audio',
            '--no-default-browser-check', '--no-service-autorun', '--password-store=basic',
            '--use-mock-keychain', '--single-process'
        ],
        timeout: 30000
    },
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
})

client.on('qr', (qr) => {
    console.clear()
    console.log("📱 ᴇsᴄᴀɴᴇᴀ ᴇʟ ǫʀ")
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log("🚀 ʙᴏᴛ ᴀᴄᴛɪᴠᴀᴅᴏ ━ ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝓜𝓲𝓼𝓪 ♡")
})

client.on('authenticated', () => {
    console.log("✅ ᴀᴜᴛᴇɴᴛɪᴄᴀᴅᴏ")
})

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝖀𝖙𝖎𝖑𝖎𝖉𝖆𝖉𝖊𝖘
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

function formatViews(num) {
    if (!num) return "0"
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K"
    return num.toString()
}

function isYouTubeUrl(text) {
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[\w-]+/,
        /(?:https?:\/\/)?youtu\.be\/[\w-]+/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[\w-]+/,
        /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=[\w-]+/
    ]
    return patterns.some(p => p.test(text))
}

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]+)/
    ]
    for (const p of patterns) {
        const match = url.match(p)
        if (match) return match[1]
    }
    return null
}

async function getVideoInfoById(videoId) {
    try {
        const { videos } = await yts({ videoId })
        if (videos && videos.length > 0) return videos[0]
    } catch {}
    try {
        const result = await yts(`https://youtube.com/watch?v=${videoId}`)
        if (result.videos && result.videos.length > 0) return result.videos[0]
    } catch {}
    return null
}

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕾𝖎𝖘𝖙𝖊𝖒𝖆 𝖉𝖊 𝕸𝖚𝖙𝖊
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

client.on('message_create', async (msg) => {
    try {
        if (!msg.from.includes("@g.us")) return
        if (msg.fromMe) return
        const sender = msg.author || msg.from
        const groupMuted = getMutedUsers(msg.from)
        if (groupMuted[sender]) {
            try { await msg.delete(true) } catch (e) {
                console.log("ɴᴏ sᴇ ᴘᴜᴅᴏ ʙᴏʀʀᴀʀ ᴍsɢ ᴅᴇ ᴍᴜᴛᴇᴀᴅᴏ:", e.message)
            }
        }
    } catch {}
})

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝖂𝖊𝖑𝖈𝖔𝖒𝖊 / 𝕭𝖞𝖊
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

client.on('group_join', async (notification) => {
    try {
        const gData = getGroupData(notification.chatId)
        if (!gData.welcome) return
        const chat = await client.getChatById(notification.chatId)
        const contact = await client.getContactById(notification.recipientIds[0])
        const userName = contact.pushname || notification.recipientIds[0].split("@")[0]
        let welcomeMsg = gData.welcomeMsg
            .replace(/@user/g, `@${notification.recipientIds[0].split("@")[0]}`)
            .replace(/@group/g, chat.name)
        const welcomeText = `⊹₊ ˚‧︵‿₊୨ 𝚆 𝙴 𝙻 𝙲 𝙾 𝙼 𝙴 ୧₊‿︵‧ ˚ ₊⊹\n\n${welcomeMsg}\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`
        await sendExternalAdMessage(notification.chatId, welcomeText, notification.recipientIds)
    } catch (err) {
        console.log("ᴇʀʀᴏʀ ᴡᴇʟᴄᴏᴍᴇ:", err.message)
    }
})

client.on('group_leave', async (notification) => {
    try {
        const gData = getGroupData(notification.chatId)
        if (!gData.bye) return
        const chat = await client.getChatById(notification.chatId)
        const contact = await client.getContactById(notification.recipientIds[0])
        const userName = contact.pushname || notification.recipientIds[0].split("@")[0]
        let byeMsg = gData.byeMsg
            .replace(/@user/g, `@${notification.recipientIds[0].split("@")[0]}`)
            .replace(/@group/g, chat.name)
        const byeText = `⊹₊ ˚‧︵‿₊୨ 𝙶 𝙾 𝙾 𝙳 𝙱 𝚈 𝙴 ୧₊‿︵‧ ˚ ₊⊹\n\n${byeMsg}\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`
        await sendExternalAdMessage(notification.chatId, byeText, notification.recipientIds)
    } catch (err) {
        console.log("ᴇʀʀᴏʀ ʙʏᴇ:", err.message)
    }
})

// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ
//   ✰ 𝕳𝕬𝕹𝕯𝕷𝕰𝕽 𝕻𝕽𝕴𝕹𝕮𝕴𝕻𝕬𝕷
// ꕤ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ꕤ

client.on('message', async (msg) => {
    if (!msg.body) return
// ━━━━━━━ CONFIGURACIÓN Y FUNCIONES ━━━━━━━
    const prefixes = ['.', '!', '#']; // Define tus prefijos aquí
    
    // Función para obtener datos del usuario (Simulada, asegúrate de tener tu DB o JSON)
    const getUserData = (id) => {
        if (!userData[id]) userData[id] = { exp: 0, commands: 0, banned: false };
        return userData[id];
    };

    // Funciones de comprobación
    const isOwner = (id) => config.ownerNumber.some(num => id.includes(num));
    const isUserBanned = (id) => getUserData(id).banned;
    const isChatBanned = (id) => chatData[id]?.isBanned || false;
    
    // Mensajes de error globales
    const failMessages = {
        owner: "❌ ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ᴇs sᴏʟᴏ ᴘᴀʀᴀ ᴍɪ ᴅᴜᴇɴᴏ.",
        admin: "❌ ɴᴇᴄᴇsɪᴛᴀs sᴇʀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ.",
        botAdmin: "❌ ɴᴇᴄᴇsɪᴛᴏ sᴇʀ ᴀᴅᴍɪɴ ᴘᴀʀᴀ ᴇᴊᴇᴄᴜᴛᴀʀ ᴇsᴛᴏ.",
        group: "❌ ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ sᴏʟᴏ ꜰᴜɴᴄɪᴏɴᴀ ᴇɴ ɢʀᴜᴘᴏs.",
        banned: "🚫 ᴇsᴛᴀs ʙᴀɴᴇᴀᴅᴏ ᴅᴇ MISA"
    };

    // Ayudantes para Grupos
    const getGroupChat = async (m) => await m.getChat();
    const isAdmin = async (chat, id) => {
        const p = chat.participants.find(p => p.id._serialized === id);
        return p ? (p.isAdmin || p.isSuperAdmin) : false;
    };
    const isBotAdmin = async (chat) => {
        const botId = client.info.wid._serialized;
        const p = chat.participants.find(p => p.id._serialized === botId);
        return p ? p.isAdmin : false;
    }; 
    const isGroup = msg.from.includes("@g.us")
    const sender = isGroup ? (msg.author || msg.from) : msg.from

    // ꕤ Sistema Mute
    if (isGroup) {
        const groupMuted = getMutedUsers(msg.from)
        if (groupMuted[sender]) {
            try { await msg.delete(true) } catch (e) {
                console.log("ᴍᴜᴛᴇ ᴅᴇʟᴇᴛᴇ ᴇʀʀᴏʀ:", e.message)
            }
            return
        }
    }

    // ꕤ Check Banned User
    if (isUserBanned(sender) && !isOwner(sender)) {
        return msg.reply(failMessages.banned)
    }

    // ꕤ Check Banned Chat
    if (isChatBanned(msg.from) && !isOwner(sender)) return

    // ꕤ Contar exp
    const userD = getUserData(sender)
    userD.exp = (userD.exp || 0) + Math.ceil(Math.random() * 10)

    const prefix = prefixes.find(p => msg.body.startsWith(p))
    if (!prefix) return

    const args = msg.body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    const text = args.join(" ")

    // ꕤ Contador de comandos
    userD.commands = (userD.commands || 0) + 1

    // ꕤ ━━━━━━━━━━ PING ━━━━━━━━━━ ꕤ
    if (command === "ping" || command === "p") {
        const t1 = Date.now()
        const m = await msg.reply("*✿ ᴄᴀʟᴄᴜʟᴀɴᴅᴏ...*")
        const ping = Date.now() - t1
        setTimeout(async () => {
            try {
                const chat = await msg.getChat()
                const fetchedMessages = await chat.fetchMessages({ limit: 10 })
                const messageToEdit = fetchedMessages.find(m2 => m2.id.id === m.id.id)
                if (messageToEdit) {
                    await messageToEdit.edit(`› ꕤ 𝕻𝖔𝖓𝖌 ⊹ \`${ping} ms\`\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
                } else {
                    await m.edit(`› ꕤ 𝕻𝖔𝖓𝖌 ⊹ \`${ping} ms\`\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
                }
            } catch (err) {
                console.log("ꜰᴀʟʟᴏ ᴇᴅɪᴛᴀɴᴅᴏ:", err.message)
                await msg.reply(`› ꕤ 𝕻𝖔𝖓𝖌 ⊹ \`${ping} ms\`\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
            }
        }, 500)
    }

    // ꕤ ━━━━━━━━━━ UPTIME ━━━━━━━━━━ ꕤ
    else if (command === "uptime" || command === "up" || command === "status" || command === "system") {
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)
        const fH = hours.toString().padStart(2, '0')
        const fM = minutes.toString().padStart(2, '0')
        const fS = seconds.toString().padStart(2, '0')

        const uptimeMessage = `✧ ‧₊˚ 𝚂𝚈𝚂𝚃𝙴𝙼 𝚄𝙿𝚃𝙸𝙼𝙴 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ 𝚂𝚝𝚊𝚝𝚞𝚜 ⊹ \`ᴏɴʟɪɴᴇ\`
› ✰ 𝚄𝚙𝚝𝚒𝚖𝚎 ⊹ \`${days}ᴅ ${fH}ʜ ${fM}ᴍ ${fS}s\`
› ꕤ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗 ⊹ \`Node.js ${process.version}\`
› ✰ 𝙼𝚎𝚖𝚘𝚛𝚢 ⊹ \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
› ꕤ 𝚂𝚢𝚜𝚝𝚎𝚖 ⊹ \`ᴀᴄᴛɪᴠᴇ\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`
        await sendExternalAdMessage(msg.from, uptimeMessage)
    }
// ꕤ ━━━━━━━━━━ CONVERTIDOR DE STICKERS PRO ━━━━━━━━━━ ꕤ
    else if (command === "s" || command === "sticker" || command === "stiker") {
        const quotedMsg = msg.hasQuotedMsg ? await msg.getQuotedMessage() : null;
        const targetMsg = quotedMsg || msg;

        if (targetMsg.hasMedia) {
            let statusMsg;
            try {
                // 1. Reacciona con espera y envía el mensaje inicial
                await msg.react('⏳');
                statusMsg = await msg.reply("⏳ Creando tu sticker... ✧");

                const media = await targetMsg.downloadMedia();
                
                if (media) {
                    // 2. Enviamos el sticker respondiendo al .s
await msg.reply(media, undefined, {
    sendMediaAsSticker: true,
    stickerName: "Sticker by 𝓜𝓲𝓼𝓪 ♡",
    stickerAuthor: "Yanniel",
    stickerCategories: [" ♡"]
});

                    // 3. Editamos el mensaje a éxito y cambiamos la reacción
                    await statusMsg.edit("✅ Sticker creado con éxito ✧");
                    await msg.react('✅');
                }
            } catch (error) {
                console.error("ᴇʀʀᴏʀ sᴛɪᴄᴋᴇʀ:", error.message);
                await msg.react('❌');
                if (statusMsg) await statusMsg.edit("❌ Error al procesar el media.");
            }
        } else {
            await msg.reply("✿ Debes enviar una imagen/video o responder a una con el comando *.s*");
        }
    }

/// ꕤ ━━━━━━━━━━ SECCIÓN DE IA UNIFICADA (DIRECTA) ━━━━━━━━━━ ꕤ
    const quotedMsg = msg.hasQuotedMsg ? await msg.getQuotedMessage() : null;
    const isReplyToBot = quotedMsg ? quotedMsg.fromMe : false;
    
    const iaCommands = ["ia", "gpt", "ai", "poe", "gemini", "copilot"];
    const isIaCommand = iaCommands.includes(command);
    const isIaReply = isReplyToBot && (quotedMsg?.body.includes("𝙸𝙰") || quotedMsg?.body.includes("𝓜𝓲𝓼α ♡"));

    if (isIaCommand || isIaReply) {
        const query = isIaCommand ? text : msg.body;
        
        if (!query && isIaCommand) return msg.reply("✿ ¡Hola! ¿En qué puedo ayudarte hoy? ✧");
        if (!query && isIaReply) return; 

        const chat = await msg.getChat();

        try {
            await msg.react('⏳');
            await chat.sendStateTyping();

            // --- ARRAY DE APIS ---
            const apis = [
                { url: `https://sylphy.xyz/ai/copilot?text=${encodeURIComponent(query)}&api_key=sylphy-zkacFeJ`, name: 'Sylphy-Copilot' },
                { url: `https://sylphy.xyz/ai/gemini?q=${encodeURIComponent(query)}&prompt=gemini&api_key=sylphy-zkacFeJ`, name: 'Sylphy-Gemini' },
                { url: `https://api.fz-ofc.shop/api/ai/chataiai?text=${encodeURIComponent(query)}`, name: 'Fz-AI' },
                { url: `https://api.brayanofc.shop/ai/chatgpt?text=${encodeURIComponent(query)}&key=core-key`, name: 'Brayan-GPT' },
                { url: `https://api.diego-ofc.xyz/api/ai/chatgpt?text=${encodeURIComponent(query)}`, name: 'Diego-AI' }
            ];

            let aiResponse = null;
            let success = false;

            for (const api of apis) {
                if (success) break;
                try {
                    console.log(`[LOG] Intentando con ${api.name}...`);
                    const res = await axios.get(api.url, { timeout: 15000 });

                    if (res.data && res.data.result) {
                        aiResponse = (typeof res.data.result === 'object') ? res.data.result.text : res.data.result;
                        if (aiResponse) {
                            success = true;
                            console.log(`[OK] ${api.name} respondió con éxito.`);
                        }
                    }
                } catch (e) {
                    console.error(`[FALLO] ${api.name}:`, e.message);
                    continue; 
                }
            }

            if (success && aiResponse) {
                let header = "*𝙸𝙰 - 𝙰𝚂𝚂𝙸𝚂𝚃𝙰𝙽𝚃*";
                if (command === "gemini") header = "𝙶𝙴𝙼𝙸𝙽𝙸 - 𝙸𝙰";
                if (command === "copilot") header = "𝙲𝙾𝙿𝙸𝙻𝙾𝚃 - 𝙸𝙰";
                if (isIaReply && !isIaCommand) header = "𝙸𝙰 - 𝚁𝙴𝚂𝙿𝚄𝙴𝚂𝚃𝙰"; 

                const replyText = ` ‧₊˚ ${header} ୧ֹ˖\n\n${aiResponse}\n\n> > Powered by 𝓜𝓲𝓼𝓪 ♡`;
                
                await msg.reply(replyText);
                await msg.react('✅');
            } else {
                throw new Error("Sin respuesta de APIs");
            }

        } catch (error) {
            console.error("ᴇʀʀᴏʀ ɪᴀ:", error.message);
            await msg.react('❌');
            if (isIaCommand) await msg.reply("❌ No se pudo obtener respuesta de la IA. Intenta de nuevo.");
        } finally {
            try { await chat.clearState() } catch (e) {}
        }
    }
    // -------- PLAY (AUDIO - RYUZEI + NEXY + SYLPHY) --------
else if (command === "play" || command === "ytmp3") {
    if (!text) return msg.reply("❌ Escribe la canción o pega un link de YouTube")

    try {
        let v = null, videoId = null

        if (isYouTubeUrl(text)) {
            videoId = extractVideoId(text)
            if (!videoId) return msg.reply("❌ No pude extraer el ID")

            await msg.react("⏳")

            v = await getVideoInfoById(videoId).catch(() => null)

            if (!v) {
                v = {
                    title: "Audio YouTube",
                    author: { name: "Desconocido" },
                    duration: { timestamp: "??:??" },
                    views: 0,
                    url: text,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    videoId
                }
            }

        } else {
            await msg.react("⏳")

            // 🔍 RYUZEI (PRINCIPAL)
            try {
                const { data } = await axios.get(
                    `https://api.ryuzei.xyz/search/yts?q=${encodeURIComponent(text)}`,
                    { timeout: 20000 }
                )

                if (!data.status || !data.results.length) throw "fail"

                const r = data.results[0]

                v = {
                    title: r.title,
                    videoId: r.id,
                    url: r.url,
                    thumbnail: r.thumbnail,
                    duration: { timestamp: r.duration },
                    views: r.views,
                    author: { name: "YouTube" }
                }

                videoId = r.id

            } catch {
                console.log("❌ Ryuzei falló, usando yts...")

                // 🔁 FALLBACK A YTS
                const { videos } = await yts(text)
                v = videos[0]
                if (!v) return msg.reply("❌ No encontré nada")

                videoId = v.videoId
            }
        }

        // -------- APIs --------
        let audio = null

        // 🔥 1. NEXY (PRINCIPAL)
        try {
            const { data } = await axios.get(
                `https://api.nexylight.xyz/dl/ytmp3?id=${videoId}`,
                { timeout: 12000 }
            )
            audio = data?.result?.url
        } catch {
            console.log("❌ Nexy falló, usando fallback...")
        }

        // 🔁 2. SYLPHY
        if (!audio) {
            try {
                const { data } = await axios.get(
                    `https://sylphy.xyz/download/v2/ytmp3?url=${encodeURIComponent(v.url)}&api_key=sylphy-zkacFeJ`,
                    { timeout: 12000 }
                )
                audio = data?.result?.dl_url
            } catch {
                console.log("❌ Sylphy también falló")
            }
        }

        if (!audio) {
            await msg.react("❌")
            return msg.reply("❌ No se pudo obtener el audio.")
        }

        // -------- LIMPIAR NOMBRE --------
        const safeTitle = (v.title || "audio")
            .replace(/[\\/:*?"<>|]/g, "")
            .substring(0, 60)

        const infoMessage = `✧ ‧₊˚ *YOUTUBE AUDIO* ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✰ Título: ${v.title}
› ✿ Canal: ${v.author?.name || "Desconocido"}
› ✦ Duración: ${v.duration?.timestamp || "??:??"}
› ꕤ Vistas: ${formatViews(v.views)}
› ❖ Link: ${v.url}

> Powered by 𝓜𝓲𝓼α ♡`

        try {
            // 🔥 SIEMPRE CON NOMBRE
            const resAudio = await axios.get(audio, { responseType: 'arraybuffer' })
            const buffer = Buffer.from(resAudio.data)

            const audioFile = new MessageMedia(
                'audio/mp3',
                buffer.toString('base64'),
                `${safeTitle}.mp3`
            )

            const thumb = await MessageMedia.fromUrl(
                v.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            )

            await msg.reply(thumb, undefined, { caption: infoMessage })

            await client.sendMessage(msg.from, audioFile, {
                sendAudioAsVoice: false,
                quotedMessageId: msg.id._serialized
            })

            await msg.react("✅")

        } catch {
            const audioFileOnly = await MessageMedia.fromUrl(audio, { unsafeMime: true })

            await msg.reply(infoMessage)
            await client.sendMessage(msg.from, audioFileOnly, {
                sendAudioAsVoice: false
            })

            await msg.react("✅")
        }

    } catch (err) {
        await msg.react("❌")
        await msg.reply("❌ Error: " + err.message)
    }
}
    // ꕤ ━━━━━━━━━━ PLAY2 / VIDEO ━━━━━━━━━━ ꕤ
       else if (command === "play2" || command === "video" || command === "mp4" || command === "ytv" || command === "ytmp4") {
           if (!text) return msg.reply("❌ ᴇsᴄʀɪʙᴇ ᴇʟ ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴠɪᴅᴇᴏ ᴏ ᴘᴇɢᴀ ᴜɴ ʟɪɴᴋ")
           try {
               let v = null, videoId = null
               if (isYouTubeUrl(text)) {
                   videoId = extractVideoId(text)
                   if (!videoId) return msg.reply("❌ ɴᴏ ᴘᴜᴅᴇ ᴇxᴛʀᴀᴇʀ ᴇʟ ɪᴅ")
                   await msg.react("⏳")
                   v = await getVideoInfoById(videoId)
                   if (!v) v = { title: "Video", author: { name: "?" }, duration: { timestamp: "??:??", seconds: 0 }, views: 0, seconds: 0, url: text, thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, videoId }
               } else {
                   const { videos } = await yts(text)
                   v = videos[0]
                   if (!v) { await msg.react("❌"); return msg.reply("❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴏ") }
                   videoId = v.videoId
                   await msg.react("⏳")
               }
   
               if (v.seconds && v.seconds > 600) { await msg.react("❌"); return msg.reply("❌ ᴍᴜʏ ʟᴀʀɢᴏ (ᴍᴀx 10ᴍɪɴ)") }
   
               const thumbUrl = v.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
               let info = `✧ ‧₊˚ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝚅𝙸𝙳𝙴𝙾* ୧ֹ˖ ⑅ ࣪⊹
   ⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
   › ✰ Título: ${v.title}
   › ✿ Canal: ${v.author?.name || "?"}
   › ✦ Duración: ${v.duration?.timestamp || "??:??"}
   › ꕤ Vistas: ${formatViews(v.views)}
   › ❖ Link: ${v.url}
   
   > Powered by 𝓜𝓲𝓼𝓪 ♡`
   
               let thumb
               try { thumb = await MessageMedia.fromUrl(thumbUrl, { unsafeMime: true }) } catch { thumb = null }
               if (thumb) await msg.reply(thumb, undefined, { caption: info })
               else await msg.reply(info)
   
               const videoUrl_encoded = encodeURIComponent(v.url)
               const apis = [
                   `https://api.nexylight.xyz/download/ytdlp?url=${videoUrl_encoded}&mode=video`,
                   `https://api.nexylight.xyz/dl/ytmp4?id=${videoId}`,
               ]
   
               let videoUrl = null
               for (const api of apis) {
                   try {
                       const res = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                       const contentType = res.headers.get('content-type') || ''
                       if (!contentType.includes('application/json')) continue
                       const json = await res.json()
                       if (json.status === false) continue
                       videoUrl = json.download?.url || json.result?.url || json.data?.url || json.url || null
                       if (videoUrl) break
                   } catch { continue }
               }
   
               if (!videoUrl) { await msg.react("❌"); return msg.reply("❌ ɴᴏ sᴇ ᴏʙᴛᴜᴠᴏ ᴇʟ ʟɪɴᴋ") }
   
               let videoBuffer
               try {
                   const res2 = await fetch(videoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                   if (!res2.ok) throw new Error(`HTTP ${res2.status}`)
                   videoBuffer = Buffer.from(await res2.arrayBuffer())
               } catch { await msg.react("❌"); return msg.reply("❌ ᴇʀʀᴏʀ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ") }
   
               const sizeMB = videoBuffer.length / (1024 * 1024)
               if (sizeMB > 60) { await msg.react("❌"); return msg.reply(`❌ ᴍᴜʏ ᴘᴇsᴀᴅᴏ (${sizeMB.toFixed(1)}MB)`) }
   
               if (sizeMB > 14) {
                   try {
                       const timestamp = Date.now()
                       const inputPath = `./temp_input_${timestamp}.mp4`
                       const outputPath = `./temp_output_${timestamp}.mp4`
                       fs.writeFileSync(inputPath, videoBuffer)
                       await new Promise((resolve, reject) => {
                           ffmpeg(inputPath)
                               .outputOptions(['-c:v libx264', '-crf 32', '-preset ultrafast', '-c:a aac', '-b:a 64k', '-vf scale=480:-2', '-movflags +faststart', '-fs 14M'])
                               .output(outputPath).on('end', resolve).on('error', reject).run()
                       })
                       videoBuffer = fs.readFileSync(outputPath)
                       try { fs.unlinkSync(inputPath) } catch {}
                       try { fs.unlinkSync(outputPath) } catch {}
                   } catch { await msg.react("❌"); return msg.reply("❌ ᴇʀʀᴏʀ ᴄᴏᴍᴘʀɪᴍɪᴇɴᴅᴏ") }
               }
   
               const videoMedia = new MessageMedia('video/mp4', videoBuffer.toString('base64'), `${v.title}.mp4`)
               await msg.reply(videoMedia, undefined, { caption: `🎥 ${v.title}`, sendMediaAsDocument: sizeMB > 14 })
               await msg.react("✅")
           } catch (e) {
               await msg.react("❌"); await msg.reply(`❌ ᴇʀʀᴏʀ: ${e.message}`)
           }
       }
       
    // ꕤ ━━━━━━━━━━ TIKTOK ━━━━━━━━━━ ꕤ
    else if (command === "tiktok" || command === "tt" || command === "ttdl") {
        const url = args[0]
        if (!url || !url.includes("tiktok.com")) {
            return msg.reply("❌ ᴇɴᴠɪᴀ ᴜɴ ʟɪɴᴋ ᴅᴇ ᴛɪᴋᴛᴏᴋ ᴠᴀʟɪᴅᴏ.\n\n*ᴇᴊᴇᴍᴘʟᴏ:* .tt https://vm.tiktok.com/xxxxx")
        }
        try {
            await msg.react("⏳")
            const { data } = await axios.get(`https://api.nexylight.xyz/dl/tiktok?url=${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            })
            if (!data.status || !data.data) { await msg.react("❌"); return msg.reply("❌ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴅᴇsᴄᴀʀɢᴀʀ ᴇsᴇ ᴛɪᴋᴛᴏᴋ.") }
            const tiktok = data.data
            const videoHD = tiktok.media?.video_hd
            const videoWM = tiktok.media?.video_wm
            const audioUrl = tiktok.media?.audio
            const coverUrl = tiktok.media?.cover
            const videoUrl = videoHD || videoWM
            if (!videoUrl) { await msg.react("❌"); return msg.reply("❌ ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴏ ᴇʟ ᴠɪᴅᴇᴏ.") }

            const views = formatViews(tiktok.stats?.views)
            const likes = formatViews(tiktok.stats?.likes)
            const comments = formatViews(tiktok.stats?.comments)
            const shares = formatViews(tiktok.stats?.shares)
            const titulo = tiktok.title ? (tiktok.title.length > 150 ? tiktok.title.substring(0, 150) + "..." : tiktok.title) : "Sin título"

            const infoMessage = `✧ ‧₊˚ 𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙻 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ✰ Título: ${titulo}
› ✿ User: @${tiktok.author?.username || "desconocido"}
› ✦ Nombre: ${tiktok.author?.nickname || "Desconocido"}

› ꕤ ━━ 𝚂𝚃𝙰𝚃𝚂 ━━ ꕤ
› 👁️ Vistas: ${views}
› ❤️ Likes: ${likes}
› 💬 Comments: ${comments}
› 🔁 Shares: ${shares}

› ❖ Calidad: ${videoHD ? "ʜᴅ sɪɴ ᴍᴀʀᴄᴀ ✅" : "ᴄᴏɴ ᴍᴀʀᴄᴀ ᴅᴇ ᴀɢᴜᴀ"}
› ✰ Status: \`Success\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`

            let videoBuffer
            try {
                const res = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://www.tiktok.com/' } })
                videoBuffer = Buffer.from(res.data)
            } catch (dlErr) {
                console.log("ᴇʀʀᴏʀ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ ᴛɪᴋᴛᴏᴋ:", dlErr.message)
                if (videoHD && videoWM && videoUrl === videoHD) {
                    try {
                        const res2 = await axios.get(videoWM, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.tiktok.com/' } })
                        videoBuffer = Buffer.from(res2.data)
                    } catch { await msg.react("❌"); return msg.reply("❌ ᴇʀʀᴏʀ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ ᴇʟ ᴠɪᴅᴇᴏ.") }
                } else { await msg.react("❌"); return msg.reply("❌ ᴇʀʀᴏʀ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ ᴇʟ ᴠɪᴅᴇᴏ.") }
            }

            const sizeMB = videoBuffer.length / (1024 * 1024)
            if (sizeMB > 60) { await msg.react("❌"); return msg.reply(`❌ ᴠɪᴅᴇᴏ ᴍᴜʏ ᴘᴇsᴀᴅᴏ (${sizeMB.toFixed(1)}MB).`) }

            try {
                if (coverUrl) {
                    const coverMedia = await MessageMedia.fromUrl(coverUrl, { unsafeMime: true })
                    await msg.reply(coverMedia, undefined, { caption: infoMessage })
                } else { await msg.reply(infoMessage) }
            } catch { await msg.reply(infoMessage) }

            const videoMedia = new MessageMedia('video/mp4', videoBuffer.toString('base64'), 'tiktok_video.mp4')
            await msg.reply(videoMedia, undefined, {
                caption: `🎬 𝚃𝚒𝚔𝚃𝚘𝚔 ━ @${tiktok.author?.username || "user"}`,
                sendMediaAsDocument: sizeMB > 14
            })

            if (audioUrl) {
                try {
                    const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.tiktok.com/' } })
                    const audioMedia = new MessageMedia('audio/mpeg', Buffer.from(audioRes.data).toString('base64'), 'tiktok_audio.mp3')
                    await msg.reply(audioMedia, undefined, { sendAudioAsVoice: false })
                } catch { console.log("ᴀᴜᴅɪᴏ ᴅᴇ ᴛɪᴋᴛᴏᴋ ɴᴏ ᴅɪsᴘᴏɴɪʙʟᴇ") }
            }
            await msg.react("✅")
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴛɪᴋᴛᴏᴋ:", err.message)
            await msg.react("❌"); await msg.reply("⚠️ ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ ᴇʟ ᴛɪᴋᴛᴏᴋ.")
        }
    }

    // ꕤ ━━━━━━━━━━ OWNER COMMANDS ━━━━━━━━━━ ꕤ

    // ꕤ BAN USER
    else if (command === "ban") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const target = await getTarget(msg)
        if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀʟ ᴜsᴜᴀʀɪᴏ.\n\n*ᴇᴊᴇᴍᴘʟᴏ:* .ban @usuario ʀᴀᴢᴏɴ")
        if (isOwner(target)) return msg.reply("❌ ɴᴏ ᴘᴜᴇᴅᴇs ʙᴀɴᴇᴀʀ ᴀʟ ᴏᴡɴᴇʀ.")
        const reason = text.replace(/@\d+/g, '').trim() || "sɪɴ ʀᴀᴢᴏɴ"
        const targetUser = getUserData(target)
        targetUser.banned = true
        targetUser.bannedReason = reason
        const targetContact = await client.getContactById(target)
        const targetName = targetContact.pushname || target.split("@")[0]
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙱 𝙰 𝙽 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› 🚫 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✰ 𝚁𝚊𝚣𝚘𝚗: ${reason}
› ✿ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ʙᴀɴɴᴇᴅ 🚫\`

› ɴᴏ ᴘᴏᴅʀᴀ ᴜsᴀʀ ᴇʟ ʙᴏᴛ.

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
    }

    // ꕤ UNBAN USER
    else if (command === "unban") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const target = await getTarget(msg)
        if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀʟ ᴜsᴜᴀʀɪᴏ.")
        const targetUser = getUserData(target)
        targetUser.banned = false
        targetUser.bannedReason = ""
        const targetContact = await client.getContactById(target)
        const targetName = targetContact.pushname || target.split("@")[0]
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚄𝙽𝙱𝙰𝙽 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ✅ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✰ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴅᴇsʙᴀɴᴇᴀᴅᴏ ✅\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
    }

    // ꕤ BANCHAT
    else if (command === "banchat") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const chat = getChatData(msg.from)
        chat.isBanned = true
        await msg.reply(`⊹₊ ˚‧︵‿₊୨ 𝙱𝙰𝙽𝙲𝙷𝙰𝚃 ୧₊‿︵‧ ˚ ₊⊹\n\n🚫 ᴇsᴛᴇ ᴄʜᴀᴛ ʜᴀ sɪᴅᴏ *ʙᴀɴᴇᴀᴅᴏ*.\nᴇʟ ʙᴏᴛ ɴᴏ ʀᴇsᴘᴏɴᴅᴇʀᴀ ᴀǫᴜɪ.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
    }

    // ꕤ UNBANCHAT
    else if (command === "unbanchat") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const chat = getChatData(msg.from)
        chat.isBanned = false
        await msg.reply(`⊹₊ ˚‧︵‿₊୨ 𝚄𝙽𝙱𝙰𝙽𝙲𝙷𝙰𝚃 ୧₊‿︵‧ ˚ ₊⊹\n\n✅ ᴇsᴛᴇ ᴄʜᴀᴛ ʜᴀ sɪᴅᴏ *ᴅᴇsʙᴀɴᴇᴀᴅᴏ*.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
    }

    // ꕤ SETPREMIUM
    else if (command === "setpremium" || command === "addprem") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const target = await getTarget(msg)
        if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀʟ ᴜsᴜᴀʀɪᴏ.\n\n*ᴇᴊᴇᴍᴘʟᴏ:* .setpremium @usuario 30")
        const days = parseInt(args[args.length - 1]) || 0
        const targetUser = getUserData(target)
        targetUser.premium = true
        targetUser.premiumTime = days > 0 ? Date.now() + (days * 24 * 60 * 60 * 1000) : 0
        if (!config.premiumUsers.includes(target)) config.premiumUsers.push(target)
        const targetContact = await client.getContactById(target)
        const targetName = targetContact.pushname || target.split("@")[0]
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› 💎 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✰ 𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗: \`${days > 0 ? days + " ᴅɪᴀs" : "ᴘᴇʀᴍᴀɴᴇɴᴛᴇ"}\`
› ✿ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴘʀᴇᴍɪᴜᴍ 💎\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
    }

    // ꕤ DELPREMIUM
    else if (command === "delpremium" || command === "delprem") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const target = await getTarget(msg)
        if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀʟ ᴜsᴜᴀʀɪᴏ.")
        const targetUser = getUserData(target)
        targetUser.premium = false
        targetUser.premiumTime = 0
        const idx = config.premiumUsers.indexOf(target)
        if (idx > -1) config.premiumUsers.splice(idx, 1)
        const targetContact = await client.getContactById(target)
        const targetName = targetContact.pushname || target.split("@")[0]
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙳𝙴𝙻 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ❌ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ✰ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴘʀᴇᴍɪᴜᴍ ʀᴇᴍᴏᴠɪᴅᴏ\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
    }

    // ꕤ BANLIST
    else if (command === "banlist") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const bannedUsers = Object.entries(userData).filter(([id, data]) => data.banned)
        const bannedChats = Object.entries(chatData).filter(([id, data]) => data.isBanned)
        let list = ""
        if (bannedUsers.length > 0) {
            list += "› ꕤ ━━ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘𝚜 𝙱𝚊𝚗𝚗𝚎𝚍 ━━ ꕤ\n"
            for (const [id, data] of bannedUsers) list += `› 🚫 @${id.split("@")[0]} ━ ${data.bannedReason || "sɪɴ ʀᴀᴢᴏɴ"}\n`
        }
        if (bannedChats.length > 0) {
            list += "\n› ✰ ━━ 𝙲𝚑𝚊𝚝𝚜 𝙱𝚊𝚗𝚗𝚎𝚍 ━━ ✰\n"
            for (const [id] of bannedChats) list += `› 🚫 ${id}\n`
        }
        if (!list) return msg.reply("✅ ɴᴏ ʜᴀʏ ᴜsᴜᴀʀɪᴏs ɴɪ ᴄʜᴀᴛs ʙᴀɴᴇᴀᴅᴏs.")
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙱𝙰𝙽 𝙻𝙸𝚂𝚃 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

${list}
› ✿ Total users: \`${bannedUsers.length}\`
› ❖ Total chats: \`${bannedChats.length}\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, bannedUsers.map(([id]) => id))
    }

    // ꕤ PREMLIST
    else if (command === "premlist" || command === "premiumlist") {
        if (!isOwner(sender)) return msg.reply(failMessages.owner)
        const premUsers = Object.entries(userData).filter(([id, data]) => data.premium)
        if (premUsers.length === 0) return msg.reply("✅ ɴᴏ ʜᴀʏ ᴜsᴜᴀʀɪᴏs ᴘʀᴇᴍɪᴜᴍ.")
        let list = ""
        for (const [id, data] of premUsers) {
            const expiry = data.premiumTime > 0 ? new Date(data.premiumTime).toLocaleDateString() : "ᴘᴇʀᴍᴀɴᴇɴᴛᴇ"
            list += `› 💎 @${id.split("@")[0]} ━ ${expiry}\n`
        }
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 𝙻𝙸𝚂𝚃 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

${list}
› ✿ Total: \`${premUsers.length}\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, premUsers.map(([id]) => id))
    }

    // ꕤ ━━━━━━━━━━ ADMIN CONTROL ━━━━━━━━━━ ꕤ

    // ꕤ KICK
    else if (command === "kick" || command === "sacar") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const senderIsAdmin = await isAdmin(chat, sender)
            const senderIsOwner = isOwner(sender)
            if (!senderIsAdmin && !senderIsOwner) return msg.reply(failMessages.admin)
            if (!await isBotAdmin(chat)) return msg.reply(failMessages.botAdmin)
            const target = await getTarget(msg)
            if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀ ʟᴀ ᴘᴇʀsᴏɴᴀ.")
            if (await isAdmin(chat, target) && !senderIsOwner) return msg.reply("❌ ɴᴏ ᴘᴜᴇᴅᴏ ᴇxᴘᴜʟsᴀʀ ᴀ ᴜɴ ᴀᴅᴍɪɴ.")
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            await chat.removeParticipants([target])
            const groupMuted = getMutedUsers(msg.from)
            if (groupMuted[target]) delete groupMuted[target]
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙺 𝙸 𝙲 𝙺 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ✰ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✿ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴇxᴘᴜʟsᴀᴅᴏ ✅\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴋɪᴄᴋ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ ᴀʟ ᴇxᴘᴜʟsᴀʀ: " + err.message)
        }
    }

    // ꕤ PROMOTE / DEMOTE
    else if (command === "promote" || command === "demote") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const senderIsAdmin = await isAdmin(chat, sender)
            const senderIsOwner = isOwner(sender)
            if (!senderIsAdmin && !senderIsOwner) return msg.reply(failMessages.admin)
            if (!await isBotAdmin(chat)) return msg.reply(failMessages.botAdmin)
            const target = await getTarget(msg)
            if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀ ʟᴀ ᴘᴇʀsᴏɴᴀ.")
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            if (command === "promote") {
                await chat.promoteParticipants([target])
                await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙿𝚁𝙾𝙼𝙾𝚃𝙴 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ✰ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✿ 𝚁𝚘𝚕: \`ᴀᴅᴍɪɴ ⬆️\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
            } else {
                await chat.demoteParticipants([target])
                await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙳𝙴𝙼𝙾𝚃𝙴 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ✰ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✿ 𝚁𝚘𝚕: \`ᴍɪᴇᴍʙʀᴏ ⬇️\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
            }
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴘʀᴏᴍᴏᴛᴇ/ᴅᴇᴍᴏᴛᴇ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ MUTE
    else if (command === "mute" || command === "silenciar") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const senderIsAdmin = await isAdmin(chat, sender)
            const senderIsOwner = isOwner(sender)
            if (!senderIsAdmin && !senderIsOwner) return msg.reply(failMessages.admin)
            if (!await isBotAdmin(chat)) return msg.reply(failMessages.botAdmin)
            const target = await getTarget(msg)
            if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀ ʟᴀ ᴘᴇʀsᴏɴᴀ.")
            if (await isAdmin(chat, target)) return msg.reply("❌ ɴᴏ ᴘᴜᴇᴅᴇs ᴍᴜᴛᴇᴀʀ ᴀ ᴜɴ ᴀᴅᴍɪɴ.")
            const groupMuted = getMutedUsers(msg.from)
            if (groupMuted[target]) return msg.reply("⚠️ ᴇsᴇ ᴜsᴜᴀʀɪᴏ ʏᴀ ᴇsᴛᴀ ᴍᴜᴛᴇᴀᴅᴏ.")
            groupMuted[target] = true
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙼 𝚄 𝚃 𝙴 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› 🔇 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✰ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴍᴜᴛᴇᴀᴅᴏ 🔇\`

› sᴜs ᴍᴇɴsᴀᴊᴇs sᴇʀᴀɴ ᴇʟɪᴍɪɴᴀᴅᴏs.

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴍᴜᴛᴇ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ UNMUTE
    else if (command === "unmute" || command === "desilenciar") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const senderIsAdmin = await isAdmin(chat, sender)
            const senderIsOwner = isOwner(sender)
            if (!senderIsAdmin && !senderIsOwner) return msg.reply(failMessages.admin)
            const target = await getTarget(msg)
            if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀ ʟᴀ ᴘᴇʀsᴏɴᴀ.")
            const groupMuted = getMutedUsers(msg.from)
            if (!groupMuted[target]) return msg.reply("⚠️ ᴇsᴇ ᴜsᴜᴀʀɪᴏ ɴᴏ ᴇsᴛᴀ ᴍᴜᴛᴇᴀᴅᴏ.")
            delete groupMuted[target]
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚄𝙽𝙼𝚄𝚃𝙴 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› 🔊 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝙽𝚞𝚖𝚎𝚛𝚘: @${target.split("@")[0]}
› ✰ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴅᴇsᴍᴜᴛᴇᴀᴅᴏ 🔊\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴜɴᴍᴜᴛᴇ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ MUTELIST
    else if (command === "mutelist" || command === "muteados") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const groupMuted = getMutedUsers(msg.from)
            const mutedIds = Object.keys(groupMuted)
            if (mutedIds.length === 0) return msg.reply("✅ ɴᴏ ʜᴀʏ ᴜsᴜᴀʀɪᴏs ᴍᴜᴛᴇᴀᴅᴏs.")
            let list = ""
            for (const id of mutedIds) {
                try {
                    const contact = await client.getContactById(id)
                    const name = contact.pushname || id.split("@")[0]
                    list += `› 🔇 \`${name}\` ━ @${id.split("@")[0]}\n`
                } catch { list += `› 🔇 @${id.split("@")[0]}\n` }
            }
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙼𝚄𝚃𝙴 𝙻𝙸𝚂𝚃 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✿ Total: \`${mutedIds.length}\`

${list}
> Powered by 𝓜𝓲𝓼𝓪 ♡`, mutedIds)
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴍᴜᴛᴇʟɪsᴛ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ OPEN / CLOSE
    else if (command === "open" || command === "close" || command === "abrir" || command === "cerrar") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const senderIsAdmin = await isAdmin(chat, sender)
            const senderIsOwner = isOwner(sender)
            if (!senderIsAdmin && !senderIsOwner) return msg.reply(failMessages.admin)
            if (!await isBotAdmin(chat)) return msg.reply(failMessages.botAdmin)
            const shouldClose = (command === "close" || command === "cerrar")
            if (shouldClose) {
                await chat.setMessagesAdminsOnly(true)
                await sendExternalAdMessage(msg.from, `🔒 *𝙶𝚛𝚞𝚙𝚘 𝙲𝚎𝚛𝚛𝚊𝚍𝚘*\n\n› sᴏʟᴏ ʟᴏs ᴀᴅᴍɪɴs ᴘᴜᴇᴅᴇɴ ᴇɴᴠɪᴀʀ ᴍᴇɴsᴀᴊᴇs.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
            } else {
                await chat.setMessagesAdminsOnly(false)
                await sendExternalAdMessage(msg.from, `🔓 *𝙶𝚛𝚞𝚙𝚘 𝙰𝚋𝚒𝚎𝚛𝚝𝚘*\n\n› ᴛᴏᴅᴏs ᴘᴜᴇᴅᴇɴ ᴇɴᴠɪᴀʀ ᴍᴇɴsᴀᴊᴇs.\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`)
            }
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴏᴘᴇɴ/ᴄʟᴏsᴇ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ WARN
    else if (command === "warn") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const senderIsAdmin = await isAdmin(chat, sender)
            const senderIsOwner = isOwner(sender)
            if (!senderIsAdmin && !senderIsOwner) return msg.reply(failMessages.admin)
            const target = await getTarget(msg)
            if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀ ʟᴀ ᴘᴇʀsᴏɴᴀ.")
            if (await isAdmin(chat, target) && !senderIsOwner) return msg.reply("❌ ɴᴏ ᴘᴜᴇᴅᴇs ᴀᴅᴠᴇʀᴛɪʀ ᴀ ᴜɴ ᴀᴅᴍɪɴ.")
            const gData = getGroupData(msg.from)
            const reason = text.replace(/@\d+/g, '').trim() || "sɪɴ ʀᴀᴢᴏɴ"
            if (!gData.warns[target]) gData.warns[target] = []
            gData.warns[target].push({ reason, by: sender, date: new Date().toLocaleString() })
            const currentWarns = gData.warns[target].length
            const limit = gData.warnLimit
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            if (limit > 0 && currentWarns >= limit) {
                if (await isBotAdmin(chat)) {
                    await chat.removeParticipants([target])
                    delete gData.warns[target]
                    const groupMuted = getMutedUsers(msg.from)
                    if (groupMuted[target]) delete groupMuted[target]
                    await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚆𝙰𝚁𝙽 𝙺𝙸𝙲𝙺 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ⚠️ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝚆𝚊𝚛𝚗𝚜: \`${currentWarns}/${limit}\`
› ✰ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ᴇxᴘᴜʟsᴀᴅᴏ ᴘᴏʀ ʟɪᴍɪᴛᴇ\`
› ✿ 𝚁𝚊𝚣𝚘𝚗: ${reason}

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
                } else {
                    await msg.reply(`⚠️ \`${targetName}\` ʟʟᴇɢᴏ ᴀʟ ʟɪᴍɪᴛᴇ ᴘᴇʀᴏ ɴᴏ sᴏʏ ᴀᴅᴍɪɴ.`)
                }
            } else {
                await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚆 𝙰 𝚁 𝙽 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ⚠️ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ 𝚆𝚊𝚛𝚗𝚜: \`${currentWarns}/${limit > 0 ? limit : "∞"}\`
› ✿ 𝚁𝚊𝚣𝚘𝚗: ${reason}
${limit > 0 ? `› ❖ Faltan: \`${limit - currentWarns}\` ᴘᴀʀᴀ ᴋɪᴄᴋ` : ""}

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
            }
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴡᴀʀɴ:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ WARNS
    else if (command === "warns") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            let target = await getTarget(msg)
            if (!target) target = sender
            const gData = getGroupData(msg.from)
            const userWarns = gData.warns[target] || []
            const limit = gData.warnLimit
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            if (userWarns.length === 0) return msg.reply(`✅ \`${targetName}\` ɴᴏ ᴛɪᴇɴᴇ ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs.`)
            let warnList = userWarns.map((w, i) => `› ✰ *${i + 1}.* ${w.reason}\n›    📅 ${w.date}`).join("\n\n")
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚆 𝙰 𝚁 𝙽 𝚂 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ⚠️ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ Total: \`${userWarns.length}/${limit > 0 ? limit : "∞"}\`

${warnList}

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
        } catch (err) {
            console.log("ᴇʀʀᴏʀ ᴡᴀʀɴs:", err.message)
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ DELWARN
    else if (command === "delwarn" || command === "resetwarn") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            if (!await isAdmin(chat, sender) && !isOwner(sender)) return msg.reply(failMessages.admin)
            const target = await getTarget(msg)
            if (!target) return msg.reply("❌ ᴍᴇɴᴄɪᴏɴᴀ ᴏ ᴄɪᴛᴀ ᴀ ʟᴀ ᴘᴇʀsᴏɴᴀ.")
            const gData = getGroupData(msg.from)
            const prevWarns = gData.warns[target]?.length || 0
            delete gData.warns[target]
            const targetContact = await client.getContactById(target)
            const targetName = targetContact.pushname || target.split("@")[0]
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙳𝙴𝙻𝚆𝙰𝚁𝙽 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ✅ 𝚄𝚜𝚞𝚊𝚛𝚒𝚘: \`${targetName}\`
› ꕤ Warns eliminados: \`${prevWarns}\`
› ✰ 𝚂𝚝𝚊𝚝𝚞𝚜: \`ʟɪᴍᴘɪᴏ\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [target])
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ SETWARNLIMIT
    else if (command === "setwarnlimit") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            if (!await isAdmin(chat, sender) && !isOwner(sender)) return msg.reply(failMessages.admin)
            const num = parseInt(args[0])
            if (isNaN(num) || num < 0) return msg.reply("❌ ᴇsᴄʀɪʙᴇ ᴜɴ ɴᴜᴍᴇʀᴏ ᴠᴀʟɪᴅᴏ.\n\n*ᴇᴊᴇᴍᴘʟᴏ:* .setwarnlimit 3")
            const gData = getGroupData(msg.from)
            gData.warnLimit = num
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚆𝙰𝚁𝙽 𝙻𝙸𝙼𝙸𝚃 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ Limite: \`${num > 0 ? num + " ᴡᴀʀɴs" : "ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ"}\`
› ✰ Accion: \`${num > 0 ? "ᴋɪᴄᴋ ᴀʟ ʟɪᴍɪᴛᴇ" : "sɪɴ ᴋɪᴄᴋ ᴀᴜᴛᴏ"}\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`)
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ TAGALL / HIDETAG
    else if (command === "tagall" || command === "hidetag") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            if (!await isAdmin(chat, sender) && !isOwner(sender)) return msg.reply(failMessages.admin)
            const participants = chat.participants
            const mentions = participants.map(p => p.id._serialized)
            if (command === "hidetag") {
                const message = text || "📢"
                await client.sendMessage(msg.from, message, { mentions })
            } else {
                let tagList = participants.map(p => `› ✰ @${p.id.user}`).join("\n")
                const message = text || "📢 ᴀᴛᴇɴᴄɪᴏɴ ᴀ ᴛᴏᴅᴏs"
                await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝚃 𝙰 𝙶 𝙰 𝙻 𝙻 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ Mensaje: ${message}
› ✿ Total: \`${participants.length} ᴍɪᴇᴍʙʀᴏs\`

${tagList}

> Powered by 𝓜𝓲𝓼𝓪 ♡`, mentions)
            }
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ WELCOME / BYE
    else if (command === "welcome" || command === "bye") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            if (!await isAdmin(chat, sender) && !isOwner(sender)) return msg.reply(failMessages.admin)
            const gData = getGroupData(msg.from)
            const option = args[0]?.toLowerCase()
            if (command === "welcome") {
                if (option === "on" || option === "1") { gData.welcome = true; await msg.reply("✅ *𝚆𝚎𝚕𝚌𝚘𝚖𝚎 ᴀᴄᴛɪᴠᴀᴅᴏ.*") }
                else if (option === "off" || option === "0") { gData.welcome = false; await msg.reply("❌ *𝚆𝚎𝚕𝚌𝚘𝚖𝚎 ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ.*") }
                else { await msg.reply(`› ꕤ *𝚆𝚎𝚕𝚌𝚘𝚖𝚎:* \`${gData.welcome ? "ON ✅" : "OFF ❌"}\`\n\n› .welcome on/off`) }
            } else {
                if (option === "on" || option === "1") { gData.bye = true; await msg.reply("✅ *𝙱𝚢𝚎 ᴀᴄᴛɪᴠᴀᴅᴏ.*") }
                else if (option === "off" || option === "0") { gData.bye = false; await msg.reply("❌ *𝙱𝚢𝚎 ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ.*") }
                else { await msg.reply(`› ꕤ *𝙱𝚢𝚎:* \`${gData.bye ? "ON ✅" : "OFF ❌"}\`\n\n› .bye on/off`) }
            }
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ SETWELCOME / SETBYE
    else if (command === "setwelcome" || command === "setbye") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            if (!await isAdmin(chat, sender) && !isOwner(sender)) return msg.reply(failMessages.admin)
            if (!text) return msg.reply(`❌ ᴇsᴄʀɪʙᴇ ᴇʟ ᴍᴇɴsᴀᴊᴇ.\n\n*ᴇᴊᴇᴍᴘʟᴏ:* .${command} ¡ʙɪᴇɴᴠᴇɴɪᴅᴏ @user!`)
            const gData = getGroupData(msg.from)
            if (command === "setwelcome") {
                gData.welcomeMsg = text
                await msg.reply(`✅ *𝙼𝚎𝚗𝚜𝚊𝚓𝚎 𝚍𝚎 𝚋𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍𝚊 ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴏ:*\n\n${text}`)
            } else {
                gData.byeMsg = text
                await msg.reply(`✅ *𝙼𝚎𝚗𝚜𝚊𝚓𝚎 𝚍𝚎 𝚍𝚎𝚜𝚙𝚎𝚍𝚒𝚍𝚊 ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴏ:*\n\n${text}`)
            }
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ TESTWELCOME / TESTBYE
    else if (command === "testwelcome" || command === "testbye") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await msg.getChat()
            const gData = getGroupData(msg.from)
            let testMsg = command === "testwelcome" ? gData.welcomeMsg : gData.byeMsg
            testMsg = testMsg.replace(/@user/g, `@${sender.split("@")[0]}`).replace(/@group/g, chat.name)
            await sendExternalAdMessage(msg.from, `⊹₊ ˚‧︵‿₊୨ 𝚃 𝙴 𝚂 𝚃 ୧₊‿︵‧ ˚ ₊⊹\n\n${testMsg}\n\n> Powered by 𝓜𝓲𝓼𝓪 ♡`, [sender])
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ INFOGP
    else if (command === "infogp" || command === "gp") {
        if (!isGroup) return msg.reply(failMessages.group)
        try {
            const chat = await getGroupChat(msg)
            if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
            const gData = getGroupData(msg.from)
            const groupMuted = getMutedUsers(msg.from)
            const mutedCount = Object.keys(groupMuted).length
            const admins = chat.participants.filter(p => p.isAdmin || p.isSuperAdmin)
            const owner = chat.participants.find(p => p.isSuperAdmin)
            const totalMembers = chat.participants.length
            const adminList = admins.map(a => `› ✰ @${a.id.user}`).join("\n")
            await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙸𝙽𝙵𝙾 𝙶𝚁𝚄𝙿𝙾 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ Nombre: ${chat.name}
› ✰ ID: \`${msg.from}\`
› ✿ Miembros: \`${totalMembers}\`
› ❖ Admins: \`${admins.length}\`
› ꕤ Creador: ${owner ? `@${owner.id.user}` : "ᴅᴇsᴄᴏɴᴏᴄɪᴅᴏ"}

› ꕤ ━━ 𝙲𝙾𝙽𝙵𝙸𝙶 ━━ ꕤ
› ✰ ᴡᴇʟᴄᴏᴍᴇ: \`${gData.welcome ? "ON ✅" : "OFF ❌"}\`
› ✿ ʙʏᴇ: \`${gData.bye ? "ON ✅" : "OFF ❌"}\`
› ❖ ᴡᴀʀɴ ʟɪᴍɪᴛ: \`${gData.warnLimit > 0 ? gData.warnLimit : "OFF"}\`
› ꕤ ᴍᴜᴛᴇᴀᴅᴏs: \`${mutedCount}\`

› ✰ ━━ 𝙰𝙳𝙼𝙸𝙽𝚂 ━━ ✰
${adminList}

> Powered by 𝓜𝓲𝓼𝓪 ♡`,
                [...admins.map(a => a.id._serialized), ...(owner ? [owner.id._serialized] : [])])
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ DEL / DELETE
    else if (command === "del" || command === "delete") {
        if (!msg.hasQuotedMsg) return msg.reply("❌ ᴄɪᴛᴀ ᴇʟ ᴍᴇɴsᴀᴊᴇ ᴀ ᴇʟɪᴍɪɴᴀʀ.")
        try {
            const quoted = await msg.getQuotedMessage()
            if (quoted.fromMe) { await quoted.delete(true); return }
            if (isGroup) {
                const chat = await getGroupChat(msg)
                if (!chat) return msg.reply("⚠️ ɴᴏ sᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ɢʀᴜᴘᴏ.")
                if (!await isAdmin(chat, sender) && !isOwner(sender)) return msg.reply(failMessages.admin)
                if (!await isBotAdmin(chat)) return msg.reply(failMessages.botAdmin)
                await quoted.delete(true)
            } else {
                await msg.reply("❌ sᴏʟᴏ ᴘᴜᴇᴅᴏ ʙᴏʀʀᴀʀ ᴍɪs ᴍsɢs ᴇɴ ᴘʀɪᴠᴀᴅᴏ.")
            }
        } catch (err) {
            await msg.reply("⚠️ ᴇʀʀᴏʀ: " + err.message)
        }
    }

    // ꕤ INFO / BOTINFO
    else if (command === "info" || command === "botinfo" || command === "boinfo") {
        const senderUser = getUserData(sender)
        const info = `✧ ‧₊˚ 𝙱𝙾𝚃 𝙸𝙽𝙵𝙾 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ Nombre ⊹ \`𝓜𝓲𝓼𝓪\`
› ✰ Creador ⊹ \`Yanniel\`
› ✿ Plataforma ⊹ \`WhatsApp Web\`
› ❖ Engine ⊹ \`Node.js ${process.version}\`
› ꕤ Libreria ⊹ \`whatsapp-web.js\`
› ✰ Prefijos ⊹ \`! . #\`

› ꕤ ━━ 𝚃𝚄 𝙿𝙴𝚁𝙵𝙸𝙻 ━━ ꕤ
› ✿ Comandos ⊹ \`${senderUser.commands || 0}\`
› ❖ Exp ⊹ \`${senderUser.exp || 0}\`
› ꕤ Premium ⊹ \`${isPremium(sender) ? "sɪ 💎" : "ɴᴏ"}\`
› ✰ Owner ⊹ \`${isOwner(sender) ? "sɪ 👑" : "ɴᴏ"}\`

> Powered by 𝓜𝓲𝓼𝓪 ♡`
        await sendExternalAdMessage(msg.from, info)
    }

    // ꕤ OWNER / CREADORA
    else if (command === "owner" || command === "creadora") {
        await sendExternalAdMessage(msg.from, `✧ ‧₊˚ 𝙾𝚆𝙽𝙴𝚁 ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹
› ꕤ Nombre ⊹ Yanniel
› ✰ Numero ⊹ @${config.ownerNumber[0]}
› ✿ GitHub ⊹ github.com/yannielmedrano1-sys

> Powered by 𝓜𝓲𝓼𝓪 ♡`, [`${config.ownerNumber[0]}@c.us`])
    }

    // ꕤ ━━━━━━━━━━ MENU ━━━━━━━━━━ ꕤ
    else if (command === "menu" || command === "help" || command === "h") {
        const pushName = msg._data.notifyName || "Usuario"
        const senderUser = getUserData(sender)
        const totalCommands = senderUser.commands || 0
        const modeUser = isPremium(sender) ? "💎 ᴘʀᴇᴍɪᴜᴍ" : "🆓 ꜰʀᴇᴇ"
        const now = new Date()
        const hora = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "America/Santo_Domingo" })
        const fecha = now.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Santo_Domingo" })

        const menuText = `Hola *${pushName}* , Soy 𝓜𝓲𝓼𝓪
> ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs

ꕤ Type ⊹      ?    
✰ Prefix ⊹ \`. ! #\`
ꕤ System ⊹ \`Active\`
✰ Owner ⊹ \`Yanniel\`
ꕤ Modo ⊹  \`ᴘʀᴇᴍɪᴜᴍ\`
✰ Hora ⊹  ${hora}
ꕤ Fecha ⊹ ${fecha}
✰ Cmds ⊹ \`${totalCommands}\`

‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
˚.⋆ֹ　 ꒰ 𝙸 𝙽 𝙵 𝙾 – 𝙱 𝙾 𝚃 ꒱ㆍ₊⊹
> ✐ Consulta el estado, la velocidad y la información general del sistema del Bot.
✿ .ping › .p
> Muestra la latencia y velocidad de respuesta actual.
✿ .status › .system
> Muestra el estado actual del servidor y el tiempo de actividad.
✿ .menu › .help
> Despliega la lista completa de comandos disponibles.
✿ .info › .botinfo
> Detalles técnicos y versiones instaladas del bot.
✿ .owner
> Proporciona el contacto oficial del desarrollador.

˚.⋆ֹ　 ꒰ 𝙳 𝙾 𝚆 𝙽 𝙻 𝙾 𝙰 𝙳 𝚂 ꒱ㆍ₊⊹
> ✐ Herramientas para obtener contenido multimedia de diversas plataformas sociales.
✿ .play › .ytmp3
> Busca música en YouTube y la descarga en formato de audio MP3.
✿ .play2 › .ytmp4
> Busca videos en YouTube y los descarga en formato de video MP4.
✿ .tiktok › .tt
> Descarga videos de TikTok sin marca de agua mediante el enlace.

˚.⋆ֹ　 ꒰ 𝚄 𝚃 𝙸 𝙻 𝙸 𝚃 𝙸 𝙴 𝚂 ꒱ㆍ₊⊹
> ✐ Funciones útiles para mejorar la experiencia diaria.
✿ .ia › .ai › .gemini
> Chat inteligente para resolver dudas o generar textos con IA.
✿ .s › .sticker
> Convierte imágenes o videos cortos en stickers personalizados.
˚.⋆ֹ　 ꒰ 𝙰 𝙽 𝙸 𝙼 𝙴 ꒱ㆍ₊⊹
> ✐ Reacciones y acciones emocionales inspiradas en escenas de anime.

> ⊹ 𝙴𝙼𝙾𝙲𝙸𝙾𝙽𝙴𝚂
✿ .angry › .enojado
✿ .bored › .aburrido
✿ .cry › .llorar
✿ .happy › .feliz
✿ .sad › .triste
✿ .scared › .asustado
✿ .shy › .timido
✿ .smile › .sonreir
✿ .blush › .sonrojarse
✿ .facepalm

> ⊹ 𝙰𝙲𝙲𝙸𝙾𝙽𝙴𝚂 𝙸𝙽𝙳𝙸𝚅𝙸𝙳𝚄𝙰𝙻𝙴𝚂
✿ .eat › .comer
✿ .sleep › .dormir
✿ .think › .pensar
✿ .dance › .bailar

> ⊹ 𝙸𝙽𝚃𝙴𝚁𝙰𝙲𝙲𝙸𝙾𝙽𝙴𝚂 (𝚄𝚜𝚊 @𝚞𝚜𝚎𝚛)
✿ .hug › .abrazar
✿ .kiss › .muak
✿ .cuddle › .acurrucarse
✿ .pat › .palmadita
✿ .bite › .morder
✿ .lick › .lamer
✿ .love › .enamorado
✿ .poke › .picar
✿ .highfive › .5
✿ .wave › .hola
✿ .wink › .guiñar

> ⊹ 𝙰𝙶𝚁𝙴𝚂𝙸𝙾𝙽𝙴𝚂 (𝙲𝚘𝚖𝚋𝚊𝚝𝚎)
✿ .punch › .pegar
✿ .slap › .bofetada
✿ .kill › .matar


> Powered by 𝓜𝓲𝓼𝓪 ♡`

        try {
            let bannerMedia = null
            if (config.useLocalBanner && fs.existsSync(config.localBannerPath)) {
                bannerMedia = MessageMedia.fromFilePath(config.localBannerPath)
            } else if (config.menuBanner && config.menuBanner !== "https://files.catbox.moe/xxxxxx.jpg") {
                bannerMedia = await MessageMedia.fromUrl(config.menuBanner, { unsafeMime: true })
            }
            if (bannerMedia) {
                await client.sendMessage(msg.from, bannerMedia, { caption: menuText })
            } else {
                await sendExternalAdMessage(msg.from, menuText)
            }
        } catch (bannerErr) {
            console.log("ᴇʀʀᴏʀ ʙᴀɴɴᴇʀ:", bannerErr.message)
            await sendExternalAdMessage(msg.from, menuText)
        }
    }

    // ꕤ ━━━━━━━━━━ SISTEMA ANIME ━━━━━━━━━━ ꕤ
    else {
        const reactions = {
            angry: ["angry", "enojado", "furioso"],
    bored: ["bored", "aburrido"],
    cry: ["cry", "llorar"],
    happy: ["happy", "feliz", "alegre"],
    sad: ["sad", "triste"],
    scared: ["scared", "asustado", "miedo"],
    shy: ["shy", "timido"],
    smile: ["smile", "sonreir"],
    blush: ["blush", "sonrojarse"],
    laugh: ["laugh", "reir", "jaja"],
    pout: ["pout", "puchero"],
    confused: ["confused", "confundido"],
    cringe: ["cringe"], 

    // 🧍 ACCIONES INDIVIDUALES
    eat: ["eat", "comer", "nom"],
    sleep: ["sleep", "dormir"],
    think: ["think", "pensar"],
    dance: ["dance", "bailar"],
    bath: ["bath", "bañarse"],
    coffee: ["coffee", "cafe"],
    drunk: ["drunk", "borracho"],
    smoke: ["smoke", "fumar"],
    walk: ["walk", "caminar"],
    run: ["run", "correr"],
    sing: ["sing", "cantar"],
    die: ["die", "morir"],
    sip: ["sip", "beber"],
    facepalm: ["facepalm"],
    stare: ["stare", "mirar"],
    thumbsup: ["thumbsup", "aprobado"],
    clap: ["clap", "aplaudir"],

    // ⚔️ AGRESIONES (Combate)
    kill: ["kill", "matar", "asesinar"],
    punch: ["punch", "pegar", "golpear"],
    slap: ["slap", "bofetada", "cachetada"],
    ssss: ["", "patear", "patada"],
    shoot: ["shoot", "disparar"],
    stab: ["stab", "apuñalar"],
    choke: ["choke", "ahorcar"],
    bonk: ["bonk", "golpe"],
    yeet: ["yeet"],

    // ❤️ INTERACCIONES
    hug: ["hug", "abrazar"],
    kiss: ["kiss", "muak", "beso"],
    cuddle: ["cuddle", "acurrucarse"],
    pat: ["pat", "palmadita", "headpat", "acariciar"],
    bite: ["bite", "morder"],
    lick: ["lick", "lamer"],
    love: ["love", "enamorado", "amor"],
    poke: ["poke", "picar"],
    highfive: ["highfive", "5", "chocar"],
    wave: ["wave", "hola", "saludar"],
    wink: ["wink", "guiñar"],
    handhold: ["handhold", "tomarmano"],
    tickle: ["tickle", "cosquillas"],
    feed: ["feed", "alimentar"],
    boop: ["boop", "tocarnariz"],
    spank: ["spank", "nalgada"]
        }

        let type = null
        for (let key in reactions) {
            if (reactions[key].includes(command)) { type = key; break }
        }

        if (type) {
            try {
                const apiUrl = `https://api.nexylight.xyz/anime/reaction?type=${type}`
                const user = await getTarget(msg)
                const contact = await client.getContactById(sender)
                const senderName = contact.pushname || "Usuario"
                let userTag = user ? user.split("@")[0] : null

                const frases = {
                   angry: ["sᴇ ᴇɴꜰᴜʀᴇᴄᴇ", "ᴇsᴛᴀʟʟᴀ ᴅᴇ ʀᴀʙɪᴀ"],
    bored: ["ᴇsᴛᴀ ᴀʙᴜʀʀɪᴅᴏ", "ɴᴏ sᴀʙᴇ ǫᴜᴇ ʜᴀᴄᴇʀ"],
    cry: ["ʟʟᴏʀᴀ", "ᴅᴇʀʀᴀᴍᴀ ʟᴀɢʀɪᴍᴀs"],
    happy: ["ᴇsᴛᴀ ꜰᴇʟɪᴢ", "ɪʀʀᴀᴅɪᴀ ꜰᴇʟɪᴄɪᴅᴀᴅ"],
    sad: ["ᴇsᴛᴀ ᴛʀɪsᴛᴇ", "sᴇ ᴅᴇᴘʀɪᴍᴇ"],
    scared: ["sᴇ ᴀsᴜsᴛᴀ", "ᴛɪᴇᴍʙʟᴀ ᴅᴇ ᴍɪᴇᴅᴏ"],
    shy: ["sᴇ ᴘᴏɴᴇ ᴛɪᴍɪᴅᴏ", "sᴇ sᴏɴʀᴏᴊᴀ"],
    smile: ["sᴏɴʀɪᴇ", "sᴏɴʀɪᴇ ᴅᴜʟᴄᴇᴍᴇɴᴛᴇ"],
    eat: ["ᴄᴏᴍᴇ", "ᴅᴇᴠᴏʀᴀ ᴄᴏᴍɪᴅᴀ"],
    sleep: ["ᴅᴜᴇʀᴍᴇ", "sᴇ ǫᴜᴇᴅᴀ ᴅᴏʀᴍɪᴅᴏ"],
    think: ["ᴘɪᴇɴsᴀ", "ʀᴇꜰʟᴇxɪᴏɴᴀ"],
    bite: ["ᴍᴜᴇʀᴅᴇ", "ʟᴇ ᴅᴀ ᴜɴ ᴍᴏʀᴅɪsᴄᴏ"],
    cuddle: ["sᴇ ᴀᴄᴜʀʀᴜᴄᴀ ᴄᴏɴ", "ᴀʙʀᴀᴢᴀ ᴄᴏɴ ᴄᴀʀɪɴᴏ ᴀ"],
    dance: ["ʙᴀɪʟᴀ ᴄᴏɴ", "sᴇ ᴍᴜᴇᴠᴇ ᴄᴏɴ"],
    hug: ["ᴀʙʀᴀᴢᴀ", "ʟᴇ ᴅᴀ ᴜɴ ᴀʙʀᴀᴢᴏ ᴄᴀʟɪᴅᴏ"],
    kiss: ["ʟᴇ ᴅᴀ ᴜɴ ʙᴇsᴏ", "ʟᴇ ʀᴏʙᴀ ᴜɴ ʙᴇsᴏ"],
    lick: ["ʟᴀᴍᴇ", "ʟᴇ ᴘᴀsᴀ ʟᴀ ʟᴇɴɢᴜᴀ"],
    love: ["ᴀᴍᴀ", "sᴇ ᴇɴᴀᴍᴏʀᴀ ᴅᴇ"],
    pat: ["ᴀᴄᴀʀɪᴄɪᴀ", "ʟᴇ ᴅᴀ ᴘᴀʟᴍᴀᴅɪᴛᴀs"],
    poke: ["ᴘɪᴄᴀ", "ʟᴇ ᴅᴀ ᴜɴ ᴛᴏǫᴜᴇ"],
    punch: ["ɢᴏʟᴘᴇᴀ", "ʟᴇ ᴅᴀ ᴜɴ ᴘᴜɴᴇᴛᴀᴢᴏ"],
    slap: ["ʟᴇ ᴅᴀ ᴜɴᴀ ʙᴏꜰᴇᴛᴀᴅᴀ", "ᴄᴀᴄʜᴇᴛᴇᴀ"],
    highfive: ["ᴄʜᴏᴄᴀ ʟᴏs ᴄɪɴᴄᴏ ᴄᴏɴ", "ᴄᴇʟᴇʙʀᴀ ᴄᴏɴ"],
    wave: ["sᴀʟᴜᴅᴀ", "ᴅɪᴄᴇ ʜᴏʟᴀ ᴀ"],
    wink: ["ɢᴜɪɴᴀ", "ʟᴇ ɢᴜɪɴᴀ ᴇʟ ᴏᴊᴏ"],
    blush: ["sᴇ sᴏɴʀᴏᴊᴀ", "sᴇ ᴘᴏɴᴇ ʀᴏᴊᴏ"],
    facepalm: ["sᴇ ᴅᴀ ᴜɴ ꜰᴀᴄᴇᴘᴀʟᴍ", "ɴᴏ ᴘᴜᴇᴅᴇ ᴄʀᴇᴇʀʟᴏ"],
    kill: ["ᴀᴄᴀʙᴀ ᴄᴏɴ", "ʟᴇ ᴅᴀ ᴇʟ ɢᴏʟᴘᴇ ꜰɪɴᴀʟ ᴀ"], // Agregado extra para kill
    kick: ["ʟᴇ ᴍᴇᴛᴇ ᴜɴᴀ ᴘᴀᴛᴀᴅᴀ ᴀ", "ᴘᴀᴛᴇᴀ ᴀ"]       // Agregado extra para kick

                }

                let lista = frases[type] || [type]
                let accion = lista[Math.floor(Math.random() * lista.length)]
                let texto = user ? `\`${senderName}\` ${accion} ᴀ @${userTag}.` : `\`${senderName}\` ${accion}.`

                let media
                try {
                    media = await MessageMedia.fromUrl(apiUrl, { unsafeMime: true })
                } catch {
                    const res = await fetch(apiUrl)
                    const buffer = await res.arrayBuffer()
                    media = new MessageMedia('video/mp4', Buffer.from(buffer).toString('base64'))
                }

                await msg.reply(media, undefined, {
                    caption: texto,
                    mentions: user ? [user] : [],
                    sendVideoAsGif: true
                })
            } catch (e) {
                console.log(e)
                await msg.reply("❌ ᴇʀʀᴏʀ ᴇɴ ᴀɴɪᴍᴇ")
            }
        }
    }
})

console.log("⏳ ɪɴɪᴄɪᴀɴᴅᴏ...")
client.initialize()
