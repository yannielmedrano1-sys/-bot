const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const yts = require('yt-search')
const axios = require('axios')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')
const fs = require('fs')

ffmpeg.setFfmpegPath(ffmpegPath)

const SERPER_KEY = "TU_KEY_SERPER"
const GEMINI_KEY = "TU_KEY_GEMINI"

const prefixes = ['!', '.', '#']

// ======================================================
//       S I S T E M A   D E   D A T O S   G R U P O
// ======================================================

const groupData = {}
const mutedUsers = {} // { "groupId": { "userId": true } }

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

// ======================================================
//       F U N C I O N E S   D E   A D M I N
// ======================================================

async function isAdmin(chat, userId) {
    const participant = chat.participants.find(p => p.id._serialized === userId)
    return participant ? (participant.isAdmin || participant.isSuperAdmin) : false
}

async function isBotAdmin(chat, client) {
    const botInfo = client.info
    const botId = botInfo.wid._serialized
    const participant = chat.participants.find(p => p.id._serialized === botId)
    return participant ? (participant.isAdmin || participant.isSuperAdmin) : false
}

// ======================================================
//              C L I E N T   S E T U P
// ======================================================

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: 'new',
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-resources',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-background-networking',
            '--disable-sync',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-extensions-with-background-pages',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--enable-automation',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-service-autorun',
            '--password-store=basic',
            '--use-mock-keychain',
            '--single-process'
        ],
        timeout: 30000
    },
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
})

client.on('qr', (qr) => {
    console.clear()
    console.log("📱 ESCANEA EL QR")
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log("🚀 BOT ACTIVADO - By Yanniel")
})

client.on('authenticated', () => {
    console.log("✅ AUTENTICADO")
})

// ======================================================
//           U T I L I D A D E S
// ======================================================

function formatViews(num) {
    if (!num) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
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

// ======================================================
//     S I S T E M A   D E   M U T E  (ELIMINAR MSGS)
// ======================================================

client.on('message_create', async (msg) => {
    try {
        if (!msg.from.includes("@g.us")) return
        if (msg.fromMe) return

        const sender = msg.author || msg.from
        const groupMuted = getMutedUsers(msg.from)

        if (groupMuted[sender]) {
            try {
                await msg.delete(true)
            } catch (e) {
                // Si no puede borrar, intentar de otra forma
                console.log("No se pudo borrar mensaje de muteado:", e.message)
            }
        }
    } catch {}
})

// ======================================================
//           W E L C O M E / B Y E   E V E N T S
// ======================================================

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

        await client.sendMessage(notification.chatId, `˚.⋆ֹ　 ꒰ W E L C O M E ꒱ㆍ₊⊹\n\n${welcomeMsg}\n\n💫 *Powered by:* \`Yanniel\` ✨`, {
            mentions: notification.recipientIds
        })
    } catch (err) {
        console.log("Error welcome event:", err.message)
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

        await client.sendMessage(notification.chatId, `˚.⋆ֹ　 ꒰ G O O D B Y E ꒱ㆍ₊⊹\n\n${byeMsg}\n\n💫 *Powered by:* \`Yanniel\` ✨`, {
            mentions: notification.recipientIds
        })
    } catch (err) {
        console.log("Error bye event:", err.message)
    }
})

// ======================================================
//            H A N D L E R   P R I N C I P A L
// ======================================================

client.on('message', async (msg) => {

    if (!msg.body) return

    // SISTEMA MUTE - Borrar mensajes de usuarios muteados
    if (msg.from.includes("@g.us")) {
        const sender = msg.author || msg.from
        const groupMuted = getMutedUsers(msg.from)

        if (groupMuted[sender]) {
            try {
                await msg.delete(true)
            } catch (e) {
                console.log("Mute delete error:", e.message)
            }
            return // No procesar comandos de usuarios muteados
        }
    }

    const prefix = prefixes.find(p => msg.body.startsWith(p))
    if (!prefix) return

    const args = msg.body.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    const text = args.join(" ")

    // -------- PING --------
    if (command === "ping" || command === "p") {
        const t1 = Date.now();
        const m = await msg.reply("*Calculando..*");
        const ping = Date.now() - t1;

        setTimeout(async () => {
            try {
                const chat = await msg.getChat();
                const fetchedMessages = await chat.fetchMessages({ limit: 10 });
                const messageToEdit = fetchedMessages.find(m2 => m2.id.id === m.id.id);

                if (messageToEdit) {
                    await messageToEdit.edit(`✰ *Pong:* \`${ping} ms\``);
                } else {
                    await m.edit(`✰ *Pong:* \`${ping} ms\``);
                }
            } catch (err) {
                console.log("Fallo editando:", err.message);
                await msg.reply(`✰ *Pong:* \`${ping} ms\``);
            }
        }, 500);
    }

    // -------- UPTIME --------
    else if (command === "uptime" || command === "up") {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const fH = hours.toString().padStart(2, '0');
        const fM = minutes.toString().padStart(2, '0');
        const fS = seconds.toString().padStart(2, '0');

        const uptimeMessage = `˚.⋆ֹ　 ꒰ S Y S T E M – U P T I M E ꒱ㆍ₊⊹

✰ *Status* ⊹ \`Online\`
ꕤ *Uptime* ⊹ \`${days}d ${fH}h ${fM}m ${fS}s\`
✰ *Version* ⊹ \`Node.js ${process.version}\`
ꕤ *Memory* ⊹ \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
✰ *System* ⊹ \`Active\`

   💫 *Powered by:* \`Yanniel\` ✨`;

        await msg.reply(uptimeMessage);
    }

    // -------- IA --------
    else if (command === "ia" || command === "search") {
        const prompt = args.join(" ")
        if (!prompt) return msg.reply("❌ Escribe algo.")

        try {
            await msg.reply("🔍 Buscando información...")

            const searchRes = await axios.post(
                "https://google.serper.dev/search",
                { q: prompt, gl: "do", hl: "es" },
                { headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' } }
            )

            const snippets = searchRes.data.organic
                ? searchRes.data.organic.map(r => r.snippet).join("\n\n")
                : "Sin resultados"

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`

            const fullPrompt = `Contexto de Google:\n${snippets}\n\nPregunta: ${prompt}\n\nResponde corto en español dominicano.`

            const aiRes = await axios.post(geminiUrl, {
                contents: [{ parts: [{ text: fullPrompt }] }]
            })

            const respuesta = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text

            await msg.reply(`🤖 **IA RESPONSE**
━━━━━━━━━━━━━━━━
${respuesta}
━━━━━━━━━━━━━━━━
By Yanniel`)

        } catch (err) {
            console.log(err)
            await msg.reply("⚠️ Error con la IA.")
        }
    }

    // -------- PLAY (AUDIO) --------
    else if (command === "play" || command === "ytmp3") {
        if (!text) return msg.reply("❌ Escribe la canción o pega un link de YouTube")

        try {
            let v = null
            let videoId = null

            if (isYouTubeUrl(text)) {
                videoId = extractVideoId(text)
                if (!videoId) return msg.reply("❌ No pude extraer el ID del video")

                await msg.react("⏳")

                v = await getVideoInfoById(videoId)

                if (!v) {
                    v = {
                        title: "Video de YouTube",
                        author: { name: "Desconocido" },
                        duration: { timestamp: "??:??" },
                        views: 0,
                        url: text,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                        videoId: videoId
                    }
                }
            } else {
                const { videos } = await yts(text)
                v = videos[0]

                if (!v) return msg.reply("❌ No encontré nada")

                videoId = v.videoId
                await msg.react("⏳")
            }

            try {
                const api = `https://api.nexylight.xyz/dl/ytmp3?id=${videoId}`

                const { data } = await axios.get(api, {
                    timeout: 45000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                })

                const audio = data.download?.url || data.result?.url || data.url

                if (!audio) {
                    await msg.react("❌")
                    return msg.reply("❌ No se obtuvo el link del audio")
                }

                const thumbUrl = v.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

                const infoMessage = `✧ ‧₊˚ YOUTUBE AUDIO ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✰ Título: ${v.title}
› ✿ Canal: ${v.author?.name || v.author || "Desconocido"}
› ✦ Duración: ${v.duration?.timestamp || "??:??"}
› ꕤ Vistas: ${formatViews(v.views)}
› ❖ Link: ${v.url}

💫 *Powered by:* \`Yanniel\` ✨`

                let media, audioMedia

                try {
                    [media, audioMedia] = await Promise.all([
                        MessageMedia.fromUrl(thumbUrl),
                        MessageMedia.fromUrl(audio, { unsafeMime: true })
                    ])
                } catch (dlErr) {
                    console.log("Error descargando media:", dlErr.message)
                    audioMedia = await MessageMedia.fromUrl(audio, { unsafeMime: true })
                    await msg.reply(infoMessage)
                    await msg.reply(audioMedia, undefined, { sendAudioAsVoice: false })
                    await msg.react("✅")
                    return
                }

                await msg.reply(media, undefined, { caption: infoMessage })
                await msg.reply(audioMedia, undefined, { sendAudioAsVoice: false })
                await msg.react("✅")

            } catch (apiErr) {
                console.log("Error API Play:", apiErr.code, apiErr.message)

                if (apiErr.code === 'ECONNABORTED') {
                    await msg.react("⏱️")
                    await msg.reply("⏱️ La API tardó mucho. Intenta de nuevo.")
                } else if (apiErr.code === 'ERR_INVALID_URL') {
                    await msg.react("❌")
                    await msg.reply("❌ URL inválida del servidor")
                } else {
                    await msg.react("❌")
                    await msg.reply("❌ Error: " + apiErr.message)
                }
            }

        } catch (err) {
            console.log("Error general Play:", err)
            await msg.react("❌")
            await msg.reply("❌ Error en play")
        }
    }

    // -------- TIKTOK --------
    else if (command === "tiktok" || command === "tt") {
        const url = args[0];
        if (!url || !url.includes("tiktok.com")) {
            return msg.reply("❌ Envía un link de TikTok válido.\n\n*Ejemplo:* .tt https://vm.tiktok.com/xxxxx");
        }

        try {
            await msg.react("⏳");

            const { data } = await axios.get(`https://api.nexylight.xyz/dl/tiktok?url=${encodeURIComponent(url)}`, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!data.status || !data.data) {
                await msg.react("❌");
                return msg.reply("❌ No se pudo descargar ese TikTok. Verifica el link.");
            }

            const tiktok = data.data;
            const videoHD = tiktok.media?.video_hd;
            const videoWM = tiktok.media?.video_wm;
            const audioUrl = tiktok.media?.audio;
            const coverUrl = tiktok.media?.cover;

            const videoUrl = videoHD || videoWM;

            if (!videoUrl) {
                await msg.react("❌");
                return msg.reply("❌ No se encontró el video en la respuesta.");
            }

            const views = formatViews(tiktok.stats?.views);
            const likes = formatViews(tiktok.stats?.likes);
            const comments = formatViews(tiktok.stats?.comments);
            const shares = formatViews(tiktok.stats?.shares);

            const titulo = tiktok.title
                ? tiktok.title.length > 150
                    ? tiktok.title.substring(0, 150) + "..."
                    : tiktok.title
                : "Sin título";

            const infoMessage = `˚.⋆ֹ　 ꒰ T I K T O K – D L ꒱ㆍ₊⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✰ *Título:* ${titulo}
› ✿ *User:* @${tiktok.author?.username || "desconocido"}
› ꕤ *Nombre:* ${tiktok.author?.nickname || "Desconocido"}

˚.⋆ֹ　 ꒰ S T A T S ꒱ㆍ₊⊹
› 👁️ *Vistas:* ${views}
› ❤️ *Likes:* ${likes}
› 💬 *Comments:* ${comments}
› 🔁 *Shares:* ${shares}

› ✦ *Calidad:* ${videoHD ? "HD Sin Marca ✅" : "Con Marca de Agua"}
› ❖ *Status:* \`Success\`

   💫 *Powered by:* \`Yanniel\` ✨`;

            let videoBuffer;
            try {
                const res = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.tiktok.com/'
                    }
                });
                videoBuffer = Buffer.from(res.data);
            } catch (dlErr) {
                console.log("Error descargando TikTok video:", dlErr.message);

                if (videoHD && videoWM && videoUrl === videoHD) {
                    try {
                        const res2 = await axios.get(videoWM, {
                            responseType: 'arraybuffer',
                            timeout: 60000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://www.tiktok.com/'
                            }
                        });
                        videoBuffer = Buffer.from(res2.data);
                    } catch {
                        await msg.react("❌");
                        return msg.reply("❌ Error descargando el video.");
                    }
                } else {
                    await msg.react("❌");
                    return msg.reply("❌ Error descargando el video.");
                }
            }

            const sizeMB = videoBuffer.length / (1024 * 1024);
            console.log(`📦 TikTok descargado: ${sizeMB.toFixed(2)} MB`);

            if (sizeMB > 60) {
                await msg.react("❌");
                return msg.reply(`❌ Video muy pesado (${sizeMB.toFixed(1)}MB).`);
            }

            try {
                if (coverUrl) {
                    const coverMedia = await MessageMedia.fromUrl(coverUrl, { unsafeMime: true });
                    await msg.reply(coverMedia, undefined, { caption: infoMessage });
                } else {
                    await msg.reply(infoMessage);
                }
            } catch {
                await msg.reply(infoMessage);
            }

            const videoMedia = new MessageMedia(
                'video/mp4',
                videoBuffer.toString('base64'),
                'tiktok_video.mp4'
            );

            await msg.reply(videoMedia, undefined, {
                caption: `🎬 TikTok - @${tiktok.author?.username || "user"}`,
                sendMediaAsDocument: sizeMB > 14
            });

            if (audioUrl) {
                try {
                    const audioRes = await axios.get(audioUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://www.tiktok.com/'
                        }
                    });

                    const audioMedia = new MessageMedia(
                        'audio/mpeg',
                        Buffer.from(audioRes.data).toString('base64'),
                        'tiktok_audio.mp3'
                    );

                    await msg.reply(audioMedia, undefined, {
                        sendAudioAsVoice: false
                    });
                } catch {
                    console.log("Audio de TikTok no disponible");
                }
            }

            await msg.react("✅");

        } catch (err) {
            console.log("Error TikTok:", err.message);
            await msg.react("❌");

            if (err.code === 'ECONNABORTED') {
                await msg.reply("⏱️ La descarga tardó mucho. Intenta de nuevo.");
            } else if (err.response?.status === 404) {
                await msg.reply("❌ Video no encontrado. Puede que sea privado.");
            } else if (err.response?.status === 429) {
                await msg.reply("⚠️ Muchas peticiones. Espera un momento.");
            } else {
                await msg.reply("⚠️ Error al descargar el TikTok.");
            }
        }
    }

    // ======================================================
    //          S I S T E M A   D E   G R U P O S
    // ======================================================

    // -------- MUTE (SILENCIAR USUARIO) --------
    else if (command === "mute" || command === "silenciar") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden mutear usuarios.");
            }

            if (!await isBotAdmin(chat, client)) {
                return msg.reply("❌ Necesito ser admin para mutear usuarios.");
            }

            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }

            if (!target) {
                return msg.reply("❌ Menciona o cita a la persona que quieres mutear.\n\n*Ejemplo:* .mute @usuario");
            }

            // NO MUTEAR ADMINS
            if (await isAdmin(chat, target)) {
                return msg.reply("❌ No puedes mutear a un admin.");
            }

            const groupMuted = getMutedUsers(msg.from);

            if (groupMuted[target]) {
                return msg.reply("⚠️ Ese usuario ya está muteado.");
            }

            groupMuted[target] = true;

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            await msg.reply(`˚.⋆ֹ　 ꒰ M U T E ꒱ㆍ₊⊹

🔇 *Usuario:* \`${targetName}\`
ꕤ *Número:* @${target.split("@")[0]}
✰ *Status:* \`Muteado 🔇\`

> Sus mensajes serán eliminados automáticamente.

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                mentions: [target]
            });

        } catch (err) {
            console.log("Error mute:", err.message);
            await msg.reply("⚠️ Error al mutear al usuario.");
        }
    }

    // -------- UNMUTE (DESMUTEAR USUARIO) --------
    else if (command === "unmute" || command === "desilenciar") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden desmutear usuarios.");
            }

            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }

            if (!target) {
                return msg.reply("❌ Menciona o cita a la persona que quieres desmutear.\n\n*Ejemplo:* .unmute @usuario");
            }

            const groupMuted = getMutedUsers(msg.from);

            if (!groupMuted[target]) {
                return msg.reply("⚠️ Ese usuario no está muteado.");
            }

            delete groupMuted[target];

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            await msg.reply(`˚.⋆ֹ　 ꒰ U N M U T E ꒱ㆍ₊⊹

🔊 *Usuario:* \`${targetName}\`
ꕤ *Número:* @${target.split("@")[0]}
✰ *Status:* \`Desmuteado 🔊\`

> Ahora puede enviar mensajes normalmente.

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                mentions: [target]
            });

        } catch (err) {
            console.log("Error unmute:", err.message);
            await msg.reply("⚠️ Error al desmutear al usuario.");
        }
    }

    // -------- MUTELIST (VER MUTEADOS) --------
    else if (command === "mutelist" || command === "muteados") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const groupMuted = getMutedUsers(msg.from);
            const mutedIds = Object.keys(groupMuted);

            if (mutedIds.length === 0) {
                return msg.reply("✅ No hay usuarios muteados en este grupo.");
            }

            let list = "";
            for (const id of mutedIds) {
                try {
                    const contact = await client.getContactById(id);
                    const name = contact.pushname || id.split("@")[0];
                    list += `› 🔇 \`${name}\` - @${id.split("@")[0]}\n`;
                } catch {
                    list += `› 🔇 @${id.split("@")[0]}\n`;
                }
            }

            await msg.reply(`˚.⋆ֹ　 ꒰ M U T E – L I S T ꒱ㆍ₊⊹

ꕤ *Total muteados:* \`${mutedIds.length}\`

${list}
💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                mentions: mutedIds
            });

        } catch (err) {
            console.log("Error mutelist:", err.message);
            await msg.reply("⚠️ Error al obtener la lista de muteados.");
        }
    }

    // -------- OPEN / CLOSE --------
    else if (command === "open" || command === "close" || command === "abrir" || command === "cerrar") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden usar este comando.");
            }

            if (!await isBotAdmin(chat, client)) {
                return msg.reply("❌ Necesito ser admin para hacer esto.");
            }

            const shouldClose = (command === "close" || command === "cerrar");

            if (shouldClose) {
                await chat.setMessagesAdminsOnly(true);
                await msg.reply(`🔒 *Grupo cerrado*\n\n> Solo los admins pueden enviar mensajes.\n\n💫 *Powered by:* \`Yanniel\``);
            } else {
                await chat.setMessagesAdminsOnly(false);
                await msg.reply(`🔓 *Grupo abierto*\n\n> Todos los miembros pueden enviar mensajes.\n\n💫 *Powered by:* \`Yanniel\``);
            }

        } catch (err) {
            console.log("Error open/close:", err.message);
            await msg.reply("⚠️ Error al cambiar el estado del grupo.");
        }
    }

    // -------- KICK / SACAR --------
    else if (command === "kick" || command === "sacar") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden expulsar.");
            }

            if (!await isBotAdmin(chat, client)) {
                return msg.reply("❌ Necesito ser admin para expulsar.");
            }

            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }

            if (!target) {
                return msg.reply("❌ Menciona o cita a la persona que quieres expulsar.");
            }

            if (await isAdmin(chat, target)) {
                return msg.reply("❌ No puedo expulsar a un admin.");
            }

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            await chat.removeParticipants([target]);

            // Limpiar mute si estaba muteado
            const groupMuted = getMutedUsers(msg.from);
            if (groupMuted[target]) delete groupMuted[target];

            await msg.reply(`˚.⋆ֹ　 ꒰ K I C K ꒱ㆍ₊⊹

✰ *Usuario:* \`${targetName}\`
ꕤ *Número:* @${target.split("@")[0]}
✰ *Status:* \`Expulsado ✅\`

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                mentions: [target]
            });

        } catch (err) {
            console.log("Error kick:", err.message);
            await msg.reply("⚠️ Error al expulsar al usuario.");
        }
    }

    // -------- PROMOTE / DEMOTE --------
    else if (command === "promote" || command === "demote") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden usar esto.");
            }

            if (!await isBotAdmin(chat, client)) {
                return msg.reply("❌ Necesito ser admin.");
            }

            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }

            if (!target) {
                return msg.reply("❌ Menciona o cita a la persona.");
            }

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            if (command === "promote") {
                await chat.promoteParticipants([target]);
                await msg.reply(`˚.⋆ֹ　 ꒰ P R O M O T E ꒱ㆍ₊⊹

✰ *Usuario:* \`${targetName}\`
ꕤ *Número:* @${target.split("@")[0]}
✰ *Rol:* \`Admin ⬆️\`

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                    mentions: [target]
                });
            } else {
                await chat.demoteParticipants([target]);
                await msg.reply(`˚.⋆ֹ　 ꒰ D E M O T E ꒱ㆍ₊⊹

✰ *Usuario:* \`${targetName}\`
ꕤ *Número:* @${target.split("@")[0]}
✰ *Rol:* \`Miembro ⬇️\`

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                    mentions: [target]
                });
            }

        } catch (err) {
            console.log("Error promote/demote:", err.message);
            await msg.reply("⚠️ Error al cambiar el rol.");
        }
    }

    // -------- WARN --------
    else if (command === "warn") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden advertir.");
            }

            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }

            if (!target) {
                return msg.reply("❌ Menciona o cita a la persona.");
            }

            if (await isAdmin(chat, target)) {
                return msg.reply("❌ No puedes advertir a un admin.");
            }

            const gData = getGroupData(msg.from);
            const reason = text.replace(/@\d+/g, '').trim() || "Sin razón especificada";

            if (!gData.warns[target]) {
                gData.warns[target] = [];
            }

            gData.warns[target].push({
                reason: reason,
                by: sender,
                date: new Date().toLocaleString()
            });

            const currentWarns = gData.warns[target].length;
            const limit = gData.warnLimit;

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            if (limit > 0 && currentWarns >= limit) {
                if (await isBotAdmin(chat, client)) {
                    await chat.removeParticipants([target]);
                    delete gData.warns[target];

                    // Limpiar mute
                    const groupMuted = getMutedUsers(msg.from);
                    if (groupMuted[target]) delete groupMuted[target];

                    await msg.reply(`˚.⋆ֹ　 ꒰ W A R N – K I C K ꒱ㆍ₊⊹

⚠️ *Usuario:* \`${targetName}\`
ꕤ *Warns:* \`${currentWarns}/${limit}\`
✰ *Status:* \`Expulsado por límite de warns\`
› *Razón:* ${reason}

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                        mentions: [target]
                    });
                } else {
                    await msg.reply(`⚠️ \`${targetName}\` llegó al límite de warns (${currentWarns}/${limit}) pero no soy admin para expulsarlo.`);
                }
            } else {
                await msg.reply(`˚.⋆ֹ　 ꒰ W A R N ꒱ㆍ₊⊹

⚠️ *Usuario:* \`${targetName}\`
ꕤ *Warns:* \`${currentWarns}/${limit > 0 ? limit : "∞"}\`
› *Razón:* ${reason}
${limit > 0 ? `› *Faltan:* \`${limit - currentWarns}\` para ser expulsado` : ""}

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                    mentions: [target]
                });
            }

        } catch (err) {
            console.log("Error warn:", err.message);
            await msg.reply("⚠️ Error al advertir.");
        }
    }

    // -------- WARNS (VER WARNS) --------
    else if (command === "warns") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }
            if (!target) {
                target = msg.author || msg.from;
            }

            const gData = getGroupData(msg.from);
            const userWarns = gData.warns[target] || [];
            const limit = gData.warnLimit;

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            if (userWarns.length === 0) {
                return msg.reply(`✅ \`${targetName}\` no tiene advertencias.`);
            }

            let warnList = userWarns.map((w, i) => {
                return `› *${i + 1}.* ${w.reason}\n   📅 ${w.date}`;
            }).join("\n\n");

            await msg.reply(`˚.⋆ֹ　 ꒰ W A R N S ꒱ㆍ₊⊹

⚠️ *Usuario:* \`${targetName}\`
ꕤ *Total:* \`${userWarns.length}/${limit > 0 ? limit : "∞"}\`

${warnList}

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                mentions: [target]
            });

        } catch (err) {
            console.log("Error warns:", err.message);
            await msg.reply("⚠️ Error al ver warns.");
        }
    }

    // -------- DELWARN --------
    else if (command === "delwarn" || command === "resetwarn") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden eliminar warns.");
            }

            let target = msg.mentionedIds?.[0];
            if (!target && msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                target = quoted.author || quoted.from;
            }

            if (!target) {
                return msg.reply("❌ Menciona o cita a la persona.");
            }

            const gData = getGroupData(msg.from);
            const prevWarns = gData.warns[target]?.length || 0;
            delete gData.warns[target];

            const targetContact = await client.getContactById(target);
            const targetName = targetContact.pushname || target.split("@")[0];

            await msg.reply(`˚.⋆ֹ　 ꒰ D E L W A R N ꒱ㆍ₊⊹

✅ *Usuario:* \`${targetName}\`
ꕤ *Warns eliminados:* \`${prevWarns}\`
✰ *Status:* \`Limpio\`

💫 *Powered by:* \`Yanniel\` ✨`, undefined, {
                mentions: [target]
            });

        } catch (err) {
            console.log("Error delwarn:", err.message);
            await msg.reply("⚠️ Error al eliminar warns.");
        }
    }

    // -------- SETWARNLIMIT --------
    else if (command === "setwarnlimit") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden cambiar el límite.");
            }

            const num = parseInt(args[0]);

            if (isNaN(num) || num < 0) {
                return msg.reply("❌ Escribe un número válido.\n\n*Ejemplo:* .setwarnlimit 3\n*Desactivar:* .setwarnlimit 0");
            }

            const gData = getGroupData(msg.from);
            gData.warnLimit = num;

            await msg.reply(`˚.⋆ֹ　 ꒰ W A R N – L I M I T ꒱ㆍ₊⊹

✰ *Límite:* \`${num > 0 ? num + " warns" : "Desactivado"}\`
ꕤ *Acción:* \`${num > 0 ? "Kick al llegar al límite" : "Sin kick automático"}\`

💫 *Powered by:* \`Yanniel\` ✨`);

        } catch (err) {
            console.log("Error setwarnlimit:", err.message);
            await msg.reply("⚠️ Error al cambiar el límite.");
        }
    }

    // -------- TAGALL / HIDETAG --------
    else if (command === "tagall" || command === "hidetag") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden etiquetar a todos.");
            }

            const participants = chat.participants;
            const mentions = participants.map(p => p.id._serialized);

            if (command === "hidetag") {
                const message = text || "📢";
                await client.sendMessage(msg.from, message, { mentions });
            } else {
                let tagList = participants.map(p => {
                    return `› @${p.id.user}`;
                }).join("\n");

                const message = text || "📢 Atención a todos";

                await client.sendMessage(msg.from, `˚.⋆ֹ　 ꒰ T A G A L L ꒱ㆍ₊⊹

✰ *Mensaje:* ${message}
ꕤ *Total:* \`${participants.length} miembros\`

${tagList}

💫 *Powered by:* \`Yanniel\` ✨`, { mentions });
            }

        } catch (err) {
            console.log("Error tagall:", err.message);
            await msg.reply("⚠️ Error al etiquetar.");
        }
    }

    // -------- WELCOME / BYE (ACTIVAR/DESACTIVAR) --------
    else if (command === "welcome" || command === "bye") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden cambiar esto.");
            }

            const gData = getGroupData(msg.from);
            const option = args[0]?.toLowerCase();

            if (command === "welcome") {
                if (option === "on" || option === "1") {
                    gData.welcome = true;
                    await msg.reply("✅ *Welcome activado.*\n\n> Los nuevos miembros recibirán un mensaje de bienvenida.");
                } else if (option === "off" || option === "0") {
                    gData.welcome = false;
                    await msg.reply("❌ *Welcome desactivado.*");
                } else {
                    await msg.reply(`˚.⋆ֹ　 ꒰ W E L C O M E ꒱ㆍ₊⊹

✰ *Estado:* \`${gData.welcome ? "Activado ✅" : "Desactivado ❌"}\`
ꕤ *Mensaje:* ${gData.welcomeMsg}

*Uso:*
› .welcome on → Activar
› .welcome off → Desactivar
› .setwelcome texto → Cambiar mensaje
› .testwelcome → Probar mensaje

*Variables:*
› @user → Menciona al nuevo
› @group → Nombre del grupo

💫 *Powered by:* \`Yanniel\` ✨`);
                }
            } else {
                if (option === "on" || option === "1") {
                    gData.bye = true;
                    await msg.reply("✅ *Bye activado.*\n\n> Se enviará un mensaje cuando alguien salga.");
                } else if (option === "off" || option === "0") {
                    gData.bye = false;
                    await msg.reply("❌ *Bye desactivado.*");
                } else {
                    await msg.reply(`˚.⋆ֹ　 ꒰ B Y E ꒱ㆍ₊⊹

✰ *Estado:* \`${gData.bye ? "Activado ✅" : "Desactivado ❌"}\`
ꕤ *Mensaje:* ${gData.byeMsg}

*Uso:*
› .bye on → Activar
› .bye off → Desactivar
› .setbye texto → Cambiar mensaje
› .testbye → Probar mensaje

💫 *Powered by:* \`Yanniel\` ✨`);
                }
            }

        } catch (err) {
            console.log("Error welcome/bye:", err.message);
            await msg.reply("⚠️ Error al cambiar configuración.");
        }
    }

    // -------- SETWELCOME / SETBYE --------
    else if (command === "setwelcome" || command === "setbye") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;

            if (!await isAdmin(chat, sender)) {
                return msg.reply("❌ Solo los admins pueden cambiar esto.");
            }

            if (!text) {
                return msg.reply(`❌ Escribe el mensaje.\n\n*Ejemplo:* .${command} ¡Bienvenido @user a @group! 🎉\n\n*Variables:*\n› @user → Menciona al usuario\n› @group → Nombre del grupo`);
            }

            const gData = getGroupData(msg.from);

            if (command === "setwelcome") {
                gData.welcomeMsg = text;
                await msg.reply(`✅ *Mensaje de bienvenida actualizado:*\n\n${text}`);
            } else {
                gData.byeMsg = text;
                await msg.reply(`✅ *Mensaje de despedida actualizado:*\n\n${text}`);
            }

        } catch (err) {
            console.log("Error setwelcome/setbye:", err.message);
            await msg.reply("⚠️ Error al cambiar el mensaje.");
        }
    }

    // -------- TESTWELCOME / TESTBYE --------
    else if (command === "testwelcome" || command === "testbye") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const sender = msg.author || msg.from;
            const contact = await client.getContactById(sender);
            const senderName = contact.pushname || sender.split("@")[0];

            const gData = getGroupData(msg.from);

            let testMsg;
            if (command === "testwelcome") {
                testMsg = gData.welcomeMsg;
            } else {
                testMsg = gData.byeMsg;
            }

            testMsg = testMsg
                .replace(/@user/g, `@${sender.split("@")[0]}`)
                .replace(/@group/g, chat.name);

            await client.sendMessage(msg.from, `˚.⋆ֹ　 ꒰ T E S T ꒱ㆍ₊⊹
> *Así se verá el mensaje:*

${testMsg}

💫 *Powered by:* \`Yanniel\` ✨`, {
                mentions: [sender]
            });

        } catch (err) {
            console.log("Error test:", err.message);
            await msg.reply("⚠️ Error al probar.");
        }
    }

    // -------- INFOGP / GP --------
    else if (command === "infogp" || command === "gp") {
        if (!msg.from.includes("@g.us")) {
            return msg.reply("❌ Este comando solo funciona en grupos.");
        }

        try {
            const chat = await msg.getChat();
            const gData = getGroupData(msg.from);
            const groupMuted = getMutedUsers(msg.from);
            const mutedCount = Object.keys(groupMuted).length;

            const admins = chat.participants.filter(p => p.isAdmin || p.isSuperAdmin);
            const owner = chat.participants.find(p => p.isSuperAdmin);
            const totalMembers = chat.participants.length;

            const adminList = admins.map(a => `› @${a.id.user}`).join("\n");

            await client.sendMessage(msg.from, `˚.⋆ֹ　 ꒰ I N F O – G R U P O ꒱ㆍ₊⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Nombre:* ${chat.name}
ꕤ *ID:* \`${msg.from}\`
✰ *Miembros:* \`${totalMembers}\`
ꕤ *Admins:* \`${admins.length}\`
✰ *Creador:* ${owner ? `@${owner.id.user}` : "Desconocido"}
ꕤ *Descripción:* ${chat.description || "Sin descripción"}

˚.⋆ֹ　 ꒰ C O N F I G ꒱ㆍ₊⊹
› Welcome: \`${gData.welcome ? "ON ✅" : "OFF ❌"}\`
› Bye: \`${gData.bye ? "ON ✅" : "OFF ❌"}\`
› Warn Limit: \`${gData.warnLimit > 0 ? gData.warnLimit : "Desactivado"}\`
› Muteados: \`${mutedCount}\`

˚.⋆ֹ　 ꒰ A D M I N S ꒱ㆍ₊⊹
${adminList}

💫 *Powered by:* \`Yanniel\` ✨`, {
                mentions: [...admins.map(a => a.id._serialized), ...(owner ? [owner.id._serialized] : [])]
            });

        } catch (err) {
            console.log("Error infogp:", err.message);
            await msg.reply("⚠️ Error al obtener info del grupo.");
        }
    }

    // -------- DEL / DELETE --------
    else if (command === "del" || command === "delete") {
        if (!msg.hasQuotedMsg) {
            return msg.reply("❌ Cita el mensaje que quieres eliminar.");
        }

        try {
            const quoted = await msg.getQuotedMessage();

            if (quoted.fromMe) {
                await quoted.delete(true);
                return;
            }

            if (msg.from.includes("@g.us")) {
                const chat = await msg.getChat();
                const sender = msg.author || msg.from;

                if (!await isAdmin(chat, sender)) {
                    return msg.reply("❌ Solo los admins pueden borrar mensajes de otros.");
                }

                if (!await isBotAdmin(chat, client)) {
                    return msg.reply("❌ Necesito ser admin para borrar mensajes.");
                }

                await quoted.delete(true);
            } else {
                await msg.reply("❌ Solo puedo borrar mis propios mensajes en privado.");
            }

        } catch (err) {
            console.log("Error delete:", err.message);
            await msg.reply("⚠️ Error al eliminar el mensaje.");
        }
    }

    // -------- PLAY2 / VIDEO --------
    else if (command === "play2" || command === "video" || command === "mp4" || command === "ytv" || command === "ytmp4") {
        if (!text) {
            return msg.reply("❌ Escribe el nombre del video o pega un link de YouTube");
        }

        try {
            let v = null
            let videoId = null

            if (isYouTubeUrl(text)) {
                videoId = extractVideoId(text)
                if (!videoId) return msg.reply("❌ No pude extraer el ID del video")

                await msg.react("⏳")

                v = await getVideoInfoById(videoId)

                if (!v) {
                    v = {
                        title: "Video de YouTube",
                        author: { name: "Desconocido" },
                        duration: { timestamp: "??:??", seconds: 0 },
                        views: 0,
                        seconds: 0,
                        url: text,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                        videoId: videoId
                    }
                }
            } else {
                const { videos } = await yts(text);
                v = videos[0];

                if (!v) {
                    await msg.react("❌");
                    return msg.reply("❌ No se encontró el video");
                }

                videoId = v.videoId
                await msg.react("⏳");
            }

            if (v.seconds && v.seconds > 600) {
                await msg.react("❌");
                return msg.reply("❌ El video es muy largo (máx 10 min)");
            }

            const thumbUrl = v.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

            let info = `✧ ‧₊˚ YOUTUBE VIDEO ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✰ Título: ${v.title}
› ✿ Canal: ${v.author?.name || v.author || "Desconocido"}
› ✦ Duración: ${v.duration?.timestamp || "??:??"}
› ꕤ Vistas: ${formatViews(v.views)}
› ❖ Link: ${v.url}

💫 *Powered by:* \`Yanniel\` ✨`

            let thumb;
            try {
                thumb = await MessageMedia.fromUrl(thumbUrl, { unsafeMime: true });
            } catch {
                thumb = null;
            }

            if (thumb) {
                await msg.reply(thumb, undefined, { caption: info });
            } else {
                await msg.reply(info);
            }

            const videoUrl_encoded = encodeURIComponent(v.url)
            const apis = [
                `https://api.nexylight.xyz/download/ytdlp?url=${videoUrl_encoded}&mode=video`,
                `https://api.nexylight.xyz/dl/ytmp4?id=${videoId}`,
            ];

            let videoUrl = null;

            for (const api of apis) {
                try {
                    const res = await fetch(api, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                    });

                    const contentType = res.headers.get('content-type') || '';
                    if (!contentType.includes('application/json')) continue;

                    const json = await res.json();
                    if (json.status === false) continue;

                    videoUrl = json.download?.url || json.result?.url || json.data?.url || json.url || null;
                    if (videoUrl) break;

                } catch {
                    continue;
                }
            }

            if (!videoUrl) {
                await msg.react("❌");
                return msg.reply("❌ No se pudo obtener el link de descarga");
            }

            let videoBuffer;
            try {
                const res2 = await fetch(videoUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                });

                if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
                videoBuffer = Buffer.from(await res2.arrayBuffer());

            } catch (dlErr) {
                console.log("Error descargando:", dlErr.message);
                await msg.react("❌");
                return msg.reply("❌ Error descargando el video");
            }

            const sizeMB = videoBuffer.length / (1024 * 1024);
            console.log(`📦 Video descargado: ${sizeMB.toFixed(2)} MB`);

            if (sizeMB > 60) {
                await msg.react("❌");
                return msg.reply(`❌ Video muy pesado (${sizeMB.toFixed(1)}MB). Máximo ~16MB para WhatsApp.`);
            }

            if (sizeMB > 14) {
                try {
                    console.log("🔧 Comprimiendo video...");

                    const timestamp = Date.now()
                    const inputPath = `./temp_input_${timestamp}.mp4`;
                    const outputPath = `./temp_output_${timestamp}.mp4`;

                    fs.writeFileSync(inputPath, videoBuffer);

                    await new Promise((resolve, reject) => {
                        ffmpeg(inputPath)
                            .outputOptions([
                                '-c:v libx264',
                                '-crf 32',
                                '-preset ultrafast',
                                '-c:a aac',
                                '-b:a 64k',
                                '-vf scale=480:-2',
                                '-movflags +faststart',
                                '-fs 14M'
                            ])
                            .output(outputPath)
                            .on('end', resolve)
                            .on('error', reject)
                            .run();
                    });

                    videoBuffer = fs.readFileSync(outputPath);

                    try { fs.unlinkSync(inputPath); } catch {}
                    try { fs.unlinkSync(outputPath); } catch {}

                    const newSize = videoBuffer.length / (1024 * 1024);
                    console.log(`✅ Comprimido: ${sizeMB.toFixed(2)}MB → ${newSize.toFixed(2)}MB`);

                } catch (ffErr) {
                    console.log("Error ffmpeg:", ffErr.message);
                    await msg.react("❌");
                    return msg.reply("❌ Error comprimiendo el video");
                }
            }

            const videoMedia = new MessageMedia(
                'video/mp4',
                videoBuffer.toString('base64'),
                `${v.title}.mp4`
            );

            await msg.reply(videoMedia, undefined, {
                caption: `🎥 ${v.title}`,
                sendMediaAsDocument: sizeMB > 14
            });

            await msg.react("✅");

        } catch (e) {
            console.log("ERROR PLAY2:", e);
            await msg.react("❌");
            await msg.reply(`❌ Error: ${e.message}`);
        }
    }

    // -------- INFO --------
    else if (command === "info" || command === "botinfo") {
        const info = `˚.⋆ֹ　 ꒰ B O T – I N F O ꒱ㆍ₊⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

✰ *Nombre:* \`𝓜𝓲𝓼𝓪\`
ꕤ *Creador:* \`Yanniel\`
✰ *Plataforma:* \`WhatsApp Web\`
ꕤ *Engine:* \`Node.js ${process.version}\`
✰ *Librería:* \`whatsapp-web.js\`
ꕤ *Prefijos:* \`! . #\`

˚.⋆ֹ　 ꒰ F U N C I O N E S ꒱ㆍ₊⊹
› 🎵 Descarga de música (YouTube)
› 🎥 Descarga de videos (YouTube)
› 📱 Descarga de TikToks
› 🤖 IA con Gemini
› 👥 Sistema de grupos completo
› 🔇 Sistema de mute
› ⚠️ Sistema de warns
› 👋 Welcome/Bye automático
› 🎌 Reacciones anime (25+)

˚.⋆ֹ　 ꒰ S T A T S ꒱ㆍ₊⊹
› *Comandos:* \`40+\`
› *Status:* \`Active ✅\`
› *Memory:* \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`

   💫 *Powered by:* \`Yanniel\` ✨`

        await msg.reply(info)
    }

    // -------- MENU --------
    else if (command === "menu" || command === "help" || command === "h") {
        const pushName = msg._data.notifyName || "Usuario"

        await msg.reply(`Hola ${pushName}, Soy 𝓜𝓲𝓼𝓪
> ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs

ꕤ Type ⊹ Bot Owner
✰ Prefix ⊹ \`. ! #\`
ꕤ System ⊹ Active
✰ Owner ⊹ Yanniel
ꕤ Modo ⊹ Premium

˚.⋆ֹ　 ꒰ I N F O – B O T ꒱ㆍ₊⊹
✿ .ping › .p
> Muestra la latencia y velocidad de respuesta.
✿ .uptime › .up
> Muestra el tiempo activo del sistema.
✿ .info › .botinfo
> Detalles técnicos del servidor.
✿ .menu › .help
> Despliega la lista de comandos.

˚.⋆ֹ　 ꒰ D O W N L O A D S ꒱ㆍ₊⊹
✿ .play › .ytmp3
> Descarga música de YouTube (MP3).
✿ .play2 › .ytmp4 › .video › .mp4
> Descarga videos de YouTube (MP4).
✿ .tiktok › .tt
> Descarga videos de TikTok sin marca.

˚.⋆ֹ　 ꒰ U T I L I T I E S ꒱ㆍ₊⊹
✿ .ia › .search
> Chat inteligente con Gemini IA.

˚.⋆ֹ　 ꒰ G R U P O S – A D M I N ꒱ㆍ₊⊹
✿ .kick › .sacar
> Expulsa a un miembro del grupo.
✿ .promote
> Hace admin a un miembro.
✿ .demote
> Quita admin a un miembro.
✿ .open › .abrir
> Abre el grupo (todos pueden hablar).
✿ .close › .cerrar
> Cierra el grupo (solo admins).
✿ .mute › .silenciar
> Mutea a un usuario (se borran sus mensajes).
✿ .unmute › .desilenciar
> Desmutea a un usuario.
✿ .mutelist › .muteados
> Lista de usuarios muteados.
✿ .tagall
> Etiqueta a todos los miembros.
✿ .hidetag
> Etiqueta oculta a todos.
✿ .del › .delete
> Elimina un mensaje citado.

˚.⋆ֹ　 ꒰ W A R N S ꒱ㆍ₊⊹
✿ .warn @user razón
> Advierte a un usuario.
✿ .warns @user
> Ve las advertencias de alguien.
✿ .delwarn › .resetwarn
> Elimina todas las warns de alguien.
✿ .setwarnlimit número
> Cambia el límite de warns (0 = desactivado).

˚.⋆ֹ　 ꒰ W E L C O M E / B Y E ꒱ㆍ₊⊹
✿ .welcome on/off
> Activa o desactiva la bienvenida.
✿ .bye on/off
> Activa o desactiva la despedida.
✿ .setwelcome texto
> Cambia el mensaje de bienvenida.
✿ .setbye texto
> Cambia el mensaje de despedida.
✿ .testwelcome
> Prueba el mensaje de bienvenida.
✿ .testbye
> Prueba el mensaje de despedida.

˚.⋆ֹ　 ꒰ G R U P O – I N F O ꒱ㆍ₊⊹
✿ .infogp › .gp
> Info completa del grupo.

˚.⋆ֹ　 ꒰ A N I M E ꒱ㆍ₊⊹
> ✐ Reacciones y acciones emocionales.
✿ .hug › .abrazar
✿ .kiss › .muak
✿ .slap › .bofetada
✿ .punch › .pegar
✿ .pat ✿ .cuddle ✿ .bite ✿ .lick
✿ .love ✿ .poke ✿ .highfive ✿ .wave
✿ .wink ✿ .dance ✿ .cry ✿ .smile
✿ .angry ✿ .sleep ✿ .eat ✿ .think
✿ .bored ✿ .shy ✿ .happy ✿ .sad ✿ .scared  

    💫 𝓜𝓲𝓼𝓪 - Bot   
       *Powered by:* \`Yanniel\` ✨`)
    }

    // -------- SISTEMA ANIME --------
    else {
        const reactions = {
            hug: ["hug", "abrazar"],
            kiss: ["kiss", "muak"],
            slap: ["slap", "bofetada"],
            punch: ["punch", "pegar"],
            pat: ["pat"],
            cuddle: ["cuddle", "acurrucarse"],
            bite: ["bite", "morder"],
            lick: ["lick", "lamer"],
            love: ["love", "enamorado"],
            poke: ["poke"],
            highfive: ["highfive", "5"],
            wave: ["wave", "hola"],
            wink: ["wink", "guiñar"],
            dance: ["dance", "bailar"],
            cry: ["cry", "llorar"],
            smile: ["smile", "sonreir"],
            angry: ["angry", "enojado"],
            sleep: ["sleep", "dormir"],
            eat: ["eat", "comer"],
            think: ["think", "pensar"],
            bored: ["bored", "aburrido"],
            shy: ["shy", "timido"],
            happy: ["happy", "feliz"],
            sad: ["sad", "triste"],
            scared: ["scared", "asustado"]
        };

        let type = null;
        for (let key in reactions) {
            if (reactions[key].includes(command)) {
                type = key;
                break;
            }
        }

        if (type) {
            try {
                const apiUrl = `https://api.nexylight.xyz/anime/reaction?type=${type}`;

                let sender = msg.from.includes("@g.us") ? msg.author : msg.from;

                let user = msg.mentionedIds?.[0];
                if (!user && msg.hasQuotedMsg) {
                    const quoted = await msg.getQuotedMessage();
                    user = quoted.author || quoted.from;
                }

                const contact = await client.getContactById(sender);
                const senderName = contact.pushname || "Usuario";

                let userTag = user ? user.split("@")[0] : null;

                const frases = {
                    angry: ["se enfurece", "estalla de rabia", "pierde el control", "se llena de ira", "no puede contener su enojo"],
                    blush: ["se sonroja", "se pone rojo", "no puede ocultar su vergüenza", "se pone tímido", "se sonroja intensamente"],
                    bored: ["está aburrido", "no sabe qué hacer", "se muere del aburrimiento", "pierde el tiempo", "no encuentra nada interesante"],
                    cry: ["llora", "no puede dejar de llorar", "derrama lágrimas", "se pone a llorar", "se quiebra emocionalmente"],
                    happy: ["está feliz", "irradia felicidad", "no puede dejar de sonreír", "se siente alegre", "brilla de felicidad"],
                    sad: ["está triste", "se siente solo", "refleja tristeza", "se deprime", "pierde el ánimo"],
                    scared: ["se asusta", "entra en pánico", "tiembla de miedo", "se paraliza del susto", "huye del miedo"],
                    shy: ["se pone tímido", "oculta su vergüenza", "se sonroja tímidamente", "evita mirar", "se pone nervioso"],
                    smile: ["sonríe", "muestra una sonrisa", "sonríe dulcemente", "sonríe felizmente", "regala una sonrisa"],
                    eat: ["come", "devora comida", "disfruta su comida", "se da un festín", "come con gusto"],
                    sleep: ["duerme", "se queda dormido", "cae dormido", "duerme profundamente", "se echa a dormir"],
                    think: ["piensa", "reflexiona", "analiza todo", "se queda pensando", "entra en reflexión"],
                    bite: ["muerde", "le da un mordisco", "muerde juguetonamente", "ataca a mordidas", "le clava los dientes"],
                    cuddle: ["se acurruca con", "abraza con cariño a", "se pega a", "busca calor con", "se acurruca tiernamente con"],
                    dance: ["baila con", "se pone a bailar con", "muestra sus pasos con", "baila alegremente con", "se mueve con"],
                    hug: ["abraza", "le da un abrazo", "se lanza a abrazar", "abraza fuertemente", "le da un abrazo cálido"],
                    kiss: ["lanza un beso", "le roba un beso", "le planta un beso", "le da un beso", "le da un beso dulce"],
                    lick: ["lame", "le pasa la lengua", "lame juguetonamente", "le da una lamida", "lame lentamente"],
                    love: ["ama", "está enamorado de", "siente amor por", "se enamora de", "adora a"],
                    pat: ["acaricia", "le da palmaditas", "mima", "le da cariño", "acaricia suavemente"],
                    poke: ["pica", "le da un toque", "molesta suavemente", "le toca la mejilla", "llama la atención de"],
                    punch: ["golpea", "le da un puñetazo", "lanza un golpe", "ataca con fuerza", "le da un golpe fuerte"],
                    slap: ["le da una bofetada", "cachetea", "le mete una cachetada", "le da una palmada fuerte", "le suelta una bofetada"],
                    highfive: ["choca los cinco con", "celebra con", "le da un high five a", "choca manos con", "celebra junto a"],
                    wave: ["saluda", "agita la mano a", "saluda con entusiasmo a", "se despide de", "dice hola a"],
                    wink: ["guiña", "le guiña el ojo", "lanza un guiño", "guiña coquetamente", "le guiña con picardía"]
                };

                let lista = frases[type] || [type];
                let accion = lista[Math.floor(Math.random() * lista.length)];

                let texto = user
                    ? `\`${senderName}\` ${accion} a @${userTag}.`
                    : `\`${senderName}\` ${accion}.`;

                let media;
                try {
                    media = await MessageMedia.fromUrl(apiUrl, { unsafeMime: true });
                } catch {
                    const res = await fetch(apiUrl);
                    const buffer = await res.arrayBuffer();
                    media = new MessageMedia(
                        'video/mp4',
                        Buffer.from(buffer).toString('base64')
                    );
                }

                await msg.reply(media, undefined, {
                    caption: texto,
                    mentions: user ? [user] : [],
                    sendVideoAsGif: true
                });

            } catch (e) {
                console.log(e);
                await msg.reply("❌ Error en anime");
            }
        }
    }

})

console.log("⏳ Iniciando...")
client.initialize()
