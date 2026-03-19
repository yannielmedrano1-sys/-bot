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

client.on('message', async (msg) => {

if (!msg.body) return

const prefix = prefixes.find(p => msg.body.startsWith(p))
if (!prefix) return

const args = msg.body.slice(prefix.length).trim().split(/ +/)
const command = args.shift().toLowerCase()
// -------- PING CON EDICIÓN FORZADA (MÉTODO DEFINITIVO) --------

if (command === "ping" || command === "p") {
    const t1 = Date.now();

    // 1. Enviamos el mensaje inicial
    const m = await client.sendMessage(msg.from, "*Calculando..*");

    // 2. Calculamos el ping real
    const ping = Date.now() - t1;

    // 3. Esperamos 500ms para que WhatsApp "asiente" el mensaje
    setTimeout(async () => {
        try {
            // Buscamos el chat y el mensaje específico para asegurar que el ID es válido
            const chat = await msg.getChat();
            const fetchedMessages = await chat.fetchMessages({ limit: 10 });
            const messageToEdit = fetchedMessages.find(msg => msg.id.id === m.id.id);

            if (messageToEdit) {
                // Editamos el mensaje encontrado en el historial reciente
                await messageToEdit.edit(`✰ *Pong:* \`${ping} ms\``);
            } else {
                // Si por alguna razón no lo encuentra en el historial, usamos el objeto directo
                await m.edit(`✰ *Pong:* \`${ping} ms\``);
            }
        } catch (err) {
            console.log("Fallo crítico editando:", err.message);
            // Si falla todo, al menos mandamos el ping normal para no dejarte en visto
            await client.sendMessage(msg.from, `✰ *Pong:* \`${ping} ms\``);
        }
    }, 500);
}
// -------- UPTIME (ESTILO AESTHETIC) --------

if (command === "uptime" || command === "up") {

    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Formateo de tiempo con 2 dígitos
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

    msg.reply(uptimeMessage);
}

// -------- IA --------

if (command === "ia" || command === "search") {

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

msg.reply(`🤖 **IA RESPONSE**
━━━━━━━━━━━━━━━━
${respuesta}
━━━━━━━━━━━━━━━━
By Yanniel`)

} catch (err) {
console.log(err)
msg.reply("⚠️ Error con la IA.")
}

}

// -------- PLAY --------

if (command === "play") {

const text = args.join(" ")
if (!text) return msg.reply("❌ Escribe la canción")

try {

const { videos } = await yts(text)
const v = videos[0]

if (!v) return msg.reply("❌ No encontré nada")

await msg.react("⏳")

try {
  const api = `https://api.nexylight.xyz/dl/ytmp3?id=${v.videoId}`
  
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

  // ✅ FORMATEA LAS VISTAS
  const formatViews = (views) => {
    if (views >= 1000000000) return (views / 1000000000).toFixed(1) + 'B'
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views
  }

  // ✅ CREA EL MENSAJE BONITO CON FOTO
  const infoMessage = `✧ ‧₊˚ YOUTUBE AUDIO ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✰ Título: ${v.title}
› ✿ Canal: ${v.author.name}
› ✦ Duración: ${v.duration.timestamp}
› ꕤ Vistas: ${formatViews(v.views)}
› ❖ Link: ${v.url}`

  // ✅ DESCARGA TODO EN PARALELO
  const [media, audioMedia] = await Promise.all([
    MessageMedia.fromUrl(v.thumbnail),
    MessageMedia.fromUrl(audio, { unsafeMime: true })
  ])

  // ✅ ENVÍA AMBOS EN PARALELO
  await Promise.all([
    client.sendMessage(msg.from, media, { caption: infoMessage }),
    client.sendMessage(msg.from, audioMedia, { sendAudioAsVoice: false })
  ])

  await msg.react("✅")

} catch (apiErr) {
  console.log("Error API Play:", apiErr.code, apiErr.message)
  
  if (apiErr.code === 'ECONNABORTED') {
    await msg.react("⏱️")
    msg.reply("⏱️ La API tardó mucho. Intenta de nuevo.")
  } else if (apiErr.code === 'ERR_INVALID_URL') {
    await msg.react("❌")
    msg.reply("❌ URL inválida del servidor")
  } else {
    await msg.react("❌")
    msg.reply("❌ Error: " + apiErr.message)
  }
}

} catch (err) {
console.log("Error general Play:", err)
await msg.react("❌")
msg.reply("❌ Error en play")
}

}
// -------- VIDEO --------

if (command === "video") {

const text = args.join(" ")
if (!text) return msg.reply("❌ Escribe el video")

try {

const { videos } = await yts(text)
const v = videos[0]

if (!v) return msg.reply("❌ No encontré nada")

let loading = await msg.reply(`⏳ Descargando: ${v.title}`)

try {
  const api = `https://api.nexylight.xyz/dl/ytmp4?id=${v.videoId}&quality=720`
  
  const { data } = await axios.get(api, { 
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  console.log("Respuesta API Video:", JSON.stringify(data).substring(0, 200))

  const video = data.result?.url || data.url

  if (!video) {
    await loading.delete()
    return msg.reply("❌ No se obtuvo el video")
  }

  const media = await MessageMedia.fromUrl(video, { unsafeMime: true })
  await client.sendMessage(msg.from, media, {
    caption: `🎬 ${v.title}\n\nBy Yanniel`
  })
  
  await loading.delete()

} catch (apiErr) {
  console.log("Error API Video:", apiErr.code, apiErr.message)
  await loading.delete()
  
  if (apiErr.code === 'ECONNABORTED') {
    msg.reply("⏱️ El video tardó mucho. Intenta con uno más pequeño.")
  } else {
    msg.reply("❌ Error descargando el video")
  }
}

} catch (err) {
console.log("Error general Video:", err)
msg.reply("❌ Error en video")
}

}

// -------- TIKTOK --------

if (command === "tiktok" || command === "tt") {

const url = args[0]
if (!url) return msg.reply("❌ Pon el link")

try {

const api = `https://api.nexylight.xyz/dl/tiktok?url=${encodeURIComponent(url)}`

const { data } = await axios.get(api, { timeout: 45000 })

const videoUrl = data.data?.media?.video_hd || data.data?.media?.video_wm

if (!videoUrl) return msg.reply("❌ Error")

const videoMedia = await MessageMedia.fromUrl(videoUrl, { unsafeMime: true })
await client.sendMessage(msg.from, videoMedia, { caption: "🎵 TikTok Descargado" })

} catch (err) {
msg.reply("❌ Error en TikTok")
}

}
// -------- INFO --------

if (command === "info" || command === "botinfo") {

const info = `
╔═══════════════════════════════════════╗
║        ℹ️ INFO DEL BOT ℹ️        ║
╚═══════════════════════════════════════╝

🤖 Nombre: 𝓜𝓲𝓼𝓪
👤 Creador: Yanniel
📱 Plataforma: WhatsApp Web
⚙️ Engine: Node.js
📦 Librería: whatsapp-web.js

🎵 Funciones:
  • Descarga de música (YouTube)
  • Descarga de videos (YouTube)
  • Descarga de TikToks
  • Búsqueda con IA (Gemini)
  • Verificación de latencia
  • Información del bot

🔧 Comandos: 11
✅ Estado: Activo

╔═══════════════════════════════════════╗
║   💫 By Yanniel - Bot Predilecto 💫   ║
╚═══════════════════════════════════════╝
`

msg.reply(info)

}

// -------- MENU --------

if (command === "menu" || command === "help" || command === "h") {

const userName = msg.author.split("@")[0] || msg.from.split("@")[0] || "User"
const pushName = msg._data.notifyName || "Usuario"

msg.reply(`Hola ${pushName}, Soy 𝓜𝓲𝓼𝓪
> ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs

ꕤ Type ⊹ Bot Owner
✰ Prefix ⊹ .
ꕤ System ⊹ Active
✰ Owner ⊹ Yanniel
ꕤ Modo ⊹ Premium

˚.⋆ֹ　 ꒰ I N F O – B O T ꒱ㆍ₊⊹
> ✐ Consulta el estado, la velocidad y la información general del sistema del Bot.
✿ .ping › .p
> Muestra la latencia y velocidad de respuesta actual.
✿ .uptime › .up
> Muestra el tiempo que lleva activo el bot.
✿ .info › .botinfo
> Detalles técnicos y versiones instaladas del bot.
✿ .menu › .help
> Despliega la lista completa de comandos disponibles.

˚.⋆ֹ　 ꒰ D O W N L O A D S ꒱ㆍ₊⊹
> ✐ Herramientas para obtener contenido multimedia de diversas plataformas sociales.
✿ .play › .ytmp3
> Busca música en YouTube y la descarga en formato de audio MP3.
✿ .video › .ytmp4
> Busca videos en YouTube y los descarga en formato de video MP4.
✿ .tiktok › .tt
> Descarga videos de TikTok sin marca de agua mediante el enlace.

˚.⋆ֹ　 ꒰ U T I L I T I E S ꒱ㆍ₊⊹
> ✐ Funciones útiles para mejorar la experiencia diaria.
✿ .ai › .search › .gemini
> Chat inteligente para resolver dudas o generar textos con IA.


   💫 𝓜𝓲𝓼𝓪 - Bot   
       *Powered by:* \`Yanniel\` ✨          

`)

}

})

console.log("⏳ Iniciando...")
client.initialize()
