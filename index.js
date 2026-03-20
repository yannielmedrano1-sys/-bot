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


// -------- HANDLER --------
client.on('message', async (msg) => {

    // -------- BASE PREFIX --------
    const body = msg.body || "";
    const prefix = ".";

    if (!body.startsWith(prefix)) return;

    const command = body.slice(prefix.length).trim().split(" ")[0].toLowerCase();
    const text = body.slice(prefix.length + command.length).trim();

    // -------- FUNCION FORMATEAR VISTAS --------
    function formatViews(num) {
        if (!num) return "0";
        if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
        return num;
    }

    // -------- COMANDO PLAY2 / VIDEO --------
    if (command === "play2" || command === "video") {

        if (!text) {
            return client.sendMessage(msg.from, "❌ Escribe el nombre del video");
        }

        try {
            // 🔥 API
            const res = await fetch(`https://api.nexylight.xyz/search/yt?q=${encodeURIComponent(text)}`);
            const json = await res.json();

            if (!json.status) {
                return client.sendMessage(msg.from, "❌ No se encontró el video");
            }

            const data = json.data;
            const dl = json.download;

            // 📌 INFO BONITA
            let info = `✧ ‧₊˚ YOUTUBE VIDEO ୧ֹ˖ ⑅ ࣪⊹
⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹

› ✰ Título: ${data.title}
› ✿ Canal: ${data.author || "Desconocido"}
› ✦ Duración: ${data.duration}
› ꕤ Vistas: ${formatViews(data.views)}
› ❖ Link: ${data.url}`;

            // 🖼️ THUMBNAIL
            let thumb;
            try {
                thumb = await MessageMedia.fromUrl(data.thumbnail, { unsafeMime: true });
            } catch {
                thumb = null;
            }

            if (thumb) {
                await client.sendMessage(msg.from, thumb, { caption: info });
            } else {
                await client.sendMessage(msg.from, info);
            }

            // 🎥 VIDEO (FIX MIME)
            let video;
            try {
                video = await MessageMedia.fromUrl(dl.url, { unsafeMime: true });
            } catch {
                const res2 = await fetch(dl.url);
                const buffer = await res2.arrayBuffer();

                video = new MessageMedia(
                    'video/mp4',
                    Buffer.from(buffer).toString('base64')
                );
            }

            await client.sendMessage(msg.from, video, {
                caption: "🎥 Aquí tienes tu video"
            });

        } catch (e) {
            console.log("ERROR PLAY2:", e);
            client.sendMessage(msg.from, "❌ Error al buscar el video");
        }
    }

});
// -------- DOWNLOADER: TIKTOK --------

if (command === "tiktok" || command === "tt") {
    const url = args[0];
    if (!url) return msg.reply("❌ ¡Mano, falta el link de TikTok!");

    // 1. Enviamos el estado inicial
    const m = await client.sendMessage(msg.from, "*Descargando..*");

    try {
        // 2. Petición a la API (Asegúrate de tener el link de tu API aquí)
        const { data } = await axios.get(`TU_API_AQUI?url=${url}`);

        if (data.status && data.result) {
            const video = data.result;
            
            // 3. Cargamos el video desde la URL del JSON
            const media = await MessageMedia.fromUrl(video.url);

            // 4. Mandamos el video con la info detallada
            await client.sendMessage(msg.from, media, {
                caption: `˚.⋆ֹ　 ꒰ T I K T O K – D L ꒱ㆍ₊⊹

✰ *Título* ⊹ \`${video.title.split('\n')[0]}\`
ꕤ *User* ⊹ \`@${video.username}\`
✰ *Likes* ⊹ \`${video.likes.toLocaleString()}\`
ꕤ *Comments* ⊹ \`${video.comments.toLocaleString()}\`
✰ *Status* ⊹ \`Success\`

   💫 *Powered by:* \`Yanniel\` ✨`,
            });

            // 5. Borramos el "Descargando.." para limpiar el chat
            await m.delete(true);

        } else {
            await m.edit("❌ No pude encontrar ese video, bro.");
        }

    } catch (err) {
        console.log("Error TikTok:", err);
        await m.edit("⚠️ Error al conectar con el servidor de descarga.");
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
// -------- SISTEMA ANIME PRO RANDOM 🔥 --------

const { MessageMedia } = require('whatsapp-web.js');

const reactions = {
    hug: ["hug","abrazar"],
    kiss: ["kiss","muak"],
    slap: ["slap","bofetada"],
    punch: ["punch","pegar"],
    pat: ["pat"],
    cuddle: ["cuddle","acurrucarse"],
    bite: ["bite","morder"],
    lick: ["lick","lamer"],
    love: ["love","enamorado"],
    poke: ["poke"],
    highfive: ["highfive","5"],
    wave: ["wave","hola"],
    wink: ["wink","guiñar"],
    dance: ["dance","bailar"],

    cry: ["cry","llorar"],
    smile: ["smile","sonreir"],
    angry: ["angry","enojado"],
    sleep: ["sleep","dormir"],
    eat: ["eat","comer"],
    think: ["think","pensar"],
    bored: ["bored","aburrido"],
    shy: ["shy","timido"],
    happy: ["happy","feliz"],
    sad: ["sad","triste"],
    scared: ["scared","asustado"]
};

// 🔍 detectar comando
let type = null;
for (let key in reactions) {
    if (reactions[key].includes(command)) {
        type = key;
        break;
    }
}

if (type) {
    try {
        const url = `https://api.nexylight.xyz/anime/reaction?type=${type}`;

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

    // 😡 EMOCIONES
    angry: [
        "se enfurece",
        "estalla de rabia",
        "pierde el control",
        "se llena de ira",
        "no puede contener su enojo"
    ],
    blush: [
        "se sonroja",
        "se pone rojo",
        "no puede ocultar su vergüenza",
        "se pone tímido",
        "se sonroja intensamente"
    ],
    bored: [
        "está aburrido",
        "no sabe qué hacer",
        "se muere del aburrimiento",
        "pierde el tiempo",
        "no encuentra nada interesante"
    ],
    cry: [
        "llora",
        "no puede dejar de llorar",
        "derrame lágrimas",
        "se pone a llorar",
        "se quiebra emocionalmente"
    ],
    happy: [
        "está feliz",
        "irradia felicidad",
        "no puede dejar de sonreír",
        "se siente alegre",
        "brilla de felicidad"
    ],
    sad: [
        "está triste",
        "se siente solo",
        "refleja tristeza",
        "se deprime",
        "pierde el ánimo"
    ],
    scared: [
        "se asusta",
        "entra en pánico",
        "tiembla de miedo",
        "se paraliza del susto",
        "huye del miedo"
    ],
    shy: [
        "se pone tímido",
        "oculta su vergüenza",
        "se sonroja tímidamente",
        "evita mirar",
        "se pone nervioso"
    ],
    smile: [
        "sonríe",
        "muestra una sonrisa",
        "sonríe dulcemente",
        "sonríe felizmente",
        "regala una sonrisa"
    ],

    // 🧍 ACCIONES
    bath: [
        "se baña",
        "disfruta un baño",
        "se relaja en la bañera",
        "se mete a bañar",
        "toma un baño relajante"
    ],
    coffee: [
        "toma café",
        "disfruta café",
        "bebe café tranquilamente",
        "se toma un cafecito",
        "saborea su café"
    ],
    drunk: [
        "está borracho",
        "se pasa de copas",
        "no puede ni caminar",
        "anda ebrio",
        "está totalmente tomado"
    ],
    eat: [
        "come",
        "devora comida",
        "disfruta su comida",
        "se da un festín",
        "come con gusto"
    ],
    facepalm: [
        "hace facepalm",
        "se tapa la cara",
        "no puede creerlo",
        "se avergüenza",
        "se lleva la mano a la cara"
    ],
    kill: [
        "ataca",
        "lanza un ataque",
        "va al combate",
        "entra en batalla",
        "se lanza a pelear"
    ],
    sleep: [
        "duerme",
        "se queda dormido",
        "cae dormido",
        "duerme profundamente",
        "se echa a dormir"
    ],
    smoke: [
        "fuma",
        "da una calada",
        "fuma tranquilamente",
        "inhala humo",
        "fuma con estilo"
    ],
    think: [
        "piensa",
        "reflexiona",
        "analiza todo",
        "se queda pensando",
        "entra en reflexión"
    ],
    walk: [
        "camina",
        "da un paseo",
        "camina tranquilo",
        "sale a caminar",
        "camina sin prisa"
    ],

    // ❤️ INTERACCIONES
    bite: [
        "muerde",
        "le da un mordisco",
        "muerde juguetonamente",
        "ataca a mordidas",
        "le clava los dientes"
    ],
    clap: [
        "aplaude",
        "da un aplauso",
        "aplaude fuerte",
        "aplaude emocionado",
        "reconoce con aplausos"
    ],
    cuddle: [
        "se acurruca con",
        "abraza con cariño a",
        "se pega a",
        "busca calor con",
        "se acurruca tiernamente con"
    ],
    dance: [
        "baila con",
        "se pone a bailar con",
        "muestra sus pasos con",
        "baila alegremente con",
        "se mueve con"
    ],
    hug: [
        "abraza",
        "le da un abrazo",
        "se lanza a abrazar",
        "abraza fuertemente",
        "le da un abrazo cálido"
    ],
    kiss: [
        "lanza un beso",
        "le roba un beso",
        "le planta un beso",
        "le da un beso",
        "le da un beso dulce"
    ],
    lick: [
        "lama",
        "le pasa la lengua",
        "lama juguetonamente",
        "le da una lamida",
        "lama lentamente"
    ],
    love: [
        "ama",
        "está enamorado de",
        "siente amor por",
        "se enamora de",
        "adora a"
    ],
    pat: [
        "acaricia",
        "le da palmaditas",
        "mima",
        "le da cariño",
        "acaricia suavemente"
    ],
    poke: [
        "pica",
        "le da un toque",
        "molesta suavemente",
        "le toca la mejilla",
        "llama la atención de"
    ],
    punch: [
        "golpea",
        "le da un puñetazo",
        "lanza un golpe",
        "ataca con fuerza",
        "le da un golpe fuerte"
    ],
    slap: [
        "le da una bofetada",
        "cachetea",
        "le mete una cachetada",
        "le da una palmada fuerte",
        "le suelta una bofetada"
    ],
    spit: [
        "escupe",
        "escupe con desprecio",
        "lanza saliva",
        "muestra desprecio",
        "escupe molesto"
    ],
    highfive: [
        "choca los cinco con",
        "celebra con",
        "le da un high five a",
        "choca manos con",
        "celebra junto a"
    ],
    wave: [
        "saluda",
        "agita la mano a",
        "saluda con entusiasmo a",
        "se despide de",
        "dice hola a"
    ],
    wink: [
        "guiña",
        "le guiña el ojo",
        "lanza un guiño",
        "guiña coquetamente",
        "le guiña con picardía"
    ]
};

        // 🎲 elegir frase random
        let lista = frases[type] || [type];
        let accion = lista[Math.floor(Math.random() * lista.length)];

       // 📝 texto final estilo PRO
let texto = user
    ? `\`${senderName}\` ${accion} a @${userTag}.`
    : `\`${senderName}\` ${accion}.`;

        // 🔥 media
        let media;
        try {
            media = await MessageMedia.fromUrl(url, { unsafeMime: true });
        } catch {
            const res = await fetch(url);
            const buffer = await res.arrayBuffer();

            media = new MessageMedia(
                'video/mp4',
                Buffer.from(buffer).toString('base64')
            );
        }

        await client.sendMessage(msg.from, media, {
            caption: texto,
            mentions: user ? [user] : [],
            sendVideoAsGif: true
        });

    } catch (e) {
        console.log(e);
        client.sendMessage(msg.from, "❌ Error en anime");
    }
}
// -------- MENU ACTUALIZADO (ESTILO EXTENDIDO) --------

if (command === "menu" || command === "help" || command === "h") {

const pushName = msg._data.notifyName || "Usuario"

msg.reply(`Hola ${pushName}, Soy 𝓜𝓲𝓼𝓪
> ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs

ꕤ Type ⊹ Bot Owner
✰ Prefix ⊹ .
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
✿ .play2 › .ytmp4
> Descarga videos de YouTube (MP4).
✿ .tiktok › .tt
> Descarga videos de TikTok sin marca.

˚.⋆ֹ　 ꒰ U T I L I T I E S ꒱ㆍ₊⊹
✿ .ai › .search
> Chat inteligente con Gemini IA.

˚.⋆ֹ　 ꒰ A N I M E ꒱ㆍ₊⊹
> ✐ Reacciones y acciones emocionales.
✿ .angry › .enojado
> Expresa una furia incontrolable.
✿ .blush › .sonrojarse
> Muestra tu cara roja por timidez.
✿ .bored › .aburrido
> Expresa que no tienes nada que hacer.
✿ .cry › .llorar
> Derrama lágrimas de tristeza.
✿ .happy › .feliz
> Irradia alegría pura con destellos.
✿ .sad › .triste
> Refleja un sentimiento de soledad.
✿ .scared › .asustado
> Reacciona con pánico ante el terror.
✿ .shy › .timido
> Oculta tu vergüenza con ternura.
✿ .smile › .sonreir
> Muestra una sonrisa cálida y sincera.

> ⊹ ACCIONES INDIVIDUALES
✿ .bath › .bañarse
> Disfruta de un baño relajante.
✿ .coffee › .cafe
> Disfruta de una taza de café caliente.
✿ .drunk › .borracho
> Demuestra que te has pasado de copas.
✿ .eat › .comer
> Devora un delicioso plato de ramen.
✿ .facepalm
> Mano en la cara ante la estupidez.
✿ .kill › .matar
> Realiza un ataque letal de pelea.
✿ .sleep › .dormir
> Quédate profundamente dormido.
✿ .smoke › .fumar
> Dale una calada con actitud fría.
✿ .think › .pensar
> Reflexión profunda de misterio.
✿ .walk › .caminar
> Da un paseo tranquilo por la escuela.

> ⊹ INTERACCIONES CON OTROS
✿ .bite › .morder
> Clava tus dientes juguetonamente.
✿ .clap › .aplaudir
> Dale un fuerte aplauso a alguien.
✿ .cuddle › .acurrucarse
> Busca calor y afecto tiernamente.
✿ .dance › .bailar
> Realiza un baile con tus amigos.
✿ .hug › .abrazar
> Rodea con tus brazos a un usuario.
✿ .kiss › .muak
> Dale un beso dulce o apasionado.
✿ .lick › .lamer
> Pasa tu lengua por la mejilla.
✿ .love › .enamorado
> Declara tus sentimientos con corazones.
✿ .pat
> Palmaditas suaves en la cabeza.
✿ .poke
> Pica la mejilla para llamar la atención.
✿ .punch › .pegar
> Dale un puñetazo a quien te hizo enojar.
✿ .slap › .bofetada
> Dale una bofetada a quien se portó mal.
✿ .spit › .escupir
> Escupe con desprecio hacia alguien.
✿ .highfive › .5
> Choca los cinco con un compañero.
✿ .wave › .hola
> Agita la mano para saludar o despedirte.
✿ .wink › .guiñar
> Lánzale un guiño coqueto a alguien.

    💫 𝓜𝓲𝓼𝓪 - Bot   
       *Powered by:* \`Yanniel\` ✨`)

}

})

console.log("⏳ Iniciando...")
client.initialize()
