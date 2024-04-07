/*********** Packages *************/
const {
    default: Baileys,
    generateThumbnail,
    getDevice,
    DisconnectReason,
    downloadContentFromMessage,
    delay,
    downloadMediaMessage,
    useMultiFileAuthState,
    useSingleFileAuthState,
    generateWAMessage,
    prepareWAMessageMedia,
    fetchLatestBaileysVersion,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    Browsers,
    isJidGroup,
    S_WHATSAPP_NET,
    toBuffer,
    WAProto,
    extensionForMediaMessage,
    extractMessageContent,
    WAMetric,
    decryptMediaMessageBuffer
} = require('@whiskeysockets/baileys');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const { createCanvas, registerFont } = require('canvas');
const Genius = require('genius-lyrics')
const dotenv = require("dotenv");
dotenv.config();
const gis = require('g-i-s');
const sharp = require("sharp")
const { Sticker } = require('./utils/sticker.js');
const CFonts = require('cfonts');
const yargs = require('yargs/yargs');
const google = require('google-it');
const P = require('pino');
const fs = require('fs-extra');
const moment = require('moment'); // Import the moment library
const app = require('express')();
const { Boom } = require('@hapi/boom');
const gradient = require('gradient-string');
const ytdlCore = require("ytdl-core")
const yts = require('yt-search');
const { log, error } = require('console');
const fetch = require('node-fetch')
const ffmpeg = require("fluent-ffmpeg")
const https = require('https')
const got = import("got")
const { exec } = require('child_process');
const malScraper = require("mal-scraper")
const animeapi = require('@justalk/anime-api');
const { Emoji } = require("./utils/exif.js")
/**** ABOUT BOT *****/
const botName = "ASSIST BOT";
const port = process.env.PORT || 3000;
/************** CONSTANTS AND LIBS ***************/
const {
    color,
    bgColor,
    msgs,
    fileBuffer,
    getBuffer,
    isUrl,
textToImage,
    scrapeMangaTitles,
    fetchChapterImages,
    getMangaByName

} = require('./utils/fancy');
const ytdl = require('./lib/ytdl-core');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const { Chalk } = require('cfonts/lib/Chalk.js');
const { validateURL, getBuff, getInfo } = require("./yt/YT.js");
const { url } = require('inspector');
const { text } = require('express');
var ky_ttt = []
var tttawal = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
var pop = []


/*********** SERVER SETUP ************/
const start = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const ztm = Baileys({
        version: (await fetchLatestBaileysVersion()).version,
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['weeb', 'silent', '5.0.0'],
        printQRInTerminal: true,
    });

    CFonts.say(`ASSIST BOT`, {
        font: 'block',
        align: 'center',
        gradient: ['#c22b60', '#2368de']
    });
    CFonts.say(`Coded By CODEUwU`, {
        font: 'console',
        align: 'center',
        gradient: ['#DCE35B', '#45B649']
    })

    ztm.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (update.qr) {
            console.log(`[${Chalk.yellow('!')}]`, 'yellow');
            console.log(`Scan the QR code above | You can also authenticate in ${Chalk.blue(`http://localhost:${port}`)}`, 'blue');
        }
        if (connection === 'connecting') {
            console.log(
                color('[server]', '#009FFF'),
                color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                color(`${botName} is Authenticating...`, '#f12711')
            );
        } else if (connection === 'close') {
            console.log(color('[server]', '#009FFF'), color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), color(`Connection Closed, trying to reconnect`, '#f64f59'));
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                ? start()
                : console.log(
                    color('[server]', '#009FFF'),
                    color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                    color(`WA Web Logged out`, '#f64f59')
                );;
        } else if (connection == 'open') {
            console.log(
                color('[server]', '#009FFF'),
                color(moment().format('DD/MM/YY HH:mm:ss'), '#A1FFCE'),
                color(`${botName} is now Connected`, '#38ef7d')
            );
        }
    });

    app.get('/', (req, res) => {
        res.status(200).setHeader('Content-Type', 'image/png').sendFile('colorized-qr.png'); // Send the colorized QR code 
    });
    ztm.ev.on('creds.update', saveCreds);

    /******* MESSAGE **********/
    ztm.ev.on("group-participants.update", async (update) => {
        console.log(update);

        // Check if the update action is 'add', indicating a new member joined
        if (update.action === 'add') {
            // Iterate through the added participants (as there might be more than one)
            for (let participant of update.participants) {
                // Format your welcome message
                const welcomeMessage = `Hello @${participant.split('@')[0]}! Welcome to the group! \nI am AssistBot to make your whatsapp experience better! You can see my commands using  */help* command`;

                // Send the welcome message to the group
                // Ensure to replace `update.jid` with the correct group ID if necessary
                await ztm.sendMessage(update.id, {
                    image: await fileBuffer("https://i.pinimg.com/originals/79/b7/69/79b769ce986fae0c7dd7f26cc6739410.jpg"), caption: welcomeMessage,

                    contextInfo: { mentionedJid: [participant] } // Mention the new member in the message
                });
            }
        }
    });

    ztm.ev.on('messages.upsert', async (msg) => {
        try {
            if (!msg.messages) return
            const chat = msg.messages[0]
            if (chat.key.fromMe) return
            const from = chat.key.remoteJid;
            // console.log(from)
            let type = ztm.msgType = Object.keys(chat.message)[0];
            console.log(type)
            const prefix = '/'
            let isGroupMsg = isJidGroup(from)
            let t = chat.messageTimestamp
            ztm.time = moment.tz('Asia/Kolkata').format('DD/MM HH:mm:ss')
            const body = (type === 'conversation' && chat.message.conversation.startsWith(prefix)) ? chat.message.conversation : (type == 'imageMessage') && chat.message.imageMessage.caption.startsWith(prefix) ? chat.message.imageMessage.caption : (type == 'videoMessage') && chat.message.videoMessage.caption.startsWith(prefix) ? chat.message.videoMessage.caption : (type == 'extendedTextMessage') && chat.message.extendedTextMessage.text.startsWith(prefix) ? chat.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') && chat.message.buttonsResponseMessage.selectedButtonId.startsWith(prefix) ? chat.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') && chat.message.listResponseMessage.singleSelectReply.selectedRowId.startsWith(prefix) ? chat.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') && chat.message.templateButtonReplyMessage.selectedId.startsWith(prefix) ? chat.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') && chat.message.listResponseMessage.singleSelectReply.selectedRowId.startsWith(prefix) ? (chat.message.listResponseMessage.singleSelectReply.selectedRowId.startsWith(prefix) || chat.message.buttonsResponseMessage.singleSelectReply.selectedButtonId.startsWith(prefix) || chat.text.startsWith(prefix)) : ''
            const budy = (type === 'conversation' && chat.message.conversation) ? chat.message.conversation : (type == 'imageMessage') && chat.message.imageMessage.caption ? chat.message.imageMessage.caption : (type == 'videoMessage') && chat.message.videoMessage.caption ? chat.message.videoMessage.caption : (type == 'extendedTextMessage') && chat.message.extendedTextMessage.text ? chat.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') && chat.message.buttonsResponseMessage.selectedButtonId ? chat.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') && chat.message.listResponseMessage.singleSelectReply.selectedRowId ? chat.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') && chat.message.templateButtonReplyMessage.selectedId ? chat.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') && chat.message.listResponseMessage.singleSelectReply.selectedRowId ? (chat.message.listResponseMessage.singleSelectReply.selectedRowId || chat.message.buttonsResponseMessage.singleSelectReply.selectedButtonId || chat.text) : ''
            // console.log(budy)
            const cbody = (type === 'conversation') ? chat.message.conversation : (type === 'extendedTextMessage') ? chat.message.extendedTextMessage.text : ''
            let sender = isGroupMsg ? chat.key.participant : chat.key.remoteJid
            const pushname = chat.pushName
            const botNumber = ztm.user.id
            const groupId = isGroupMsg ? from : ''
            const groupMetadata = isGroupMsg ? await ztm.groupMetadata(groupId) : ''
            const groupMembers = isGroupMsg ? groupMetadata.participants : ''
            const groupAdmins = []
            for (let i of groupMembers) {
                if (i.admin === 'admin' || i.admin === 'superadmin') {

                    groupAdmins.push(i.id)
                }
            }
            const isAdmin = isGroupMsg ? groupAdmins.includes(sender) : false
            // console.log(groupId)
            let formattedTitle = isGroupMsg ? groupMetadata.subject : ''
            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
            let args = body.trim().split(/ +/).slice(1);
            const isCmd = body.startsWith(prefix)
            // console.log(isGroupMsg)
            let cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null
            const q = args.join(' ')
            const content = JSON.stringify(chat.message)
            const kuku = JSON.parse(content)
            const arg = body.substring(body.indexOf(' ') + 1)
            const isMedia = (type === 'imageMessage' || type === 'videoMessage')
            const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            var idttt = []
            var players1 = []
            var players2 = []
            var gilir = []
            var gg;
            for (let t of ky_ttt) {
                idttt.push(t.id)
                players1.push(t.player1)
                players2.push(t.player2)
                gilir.push(t.gilir)
            }
            const isTTT = isGroupMsg ? idttt.includes(from) : false
            var isPlayer1 = isGroupMsg ? players1.includes(sender) : false
            var isPlayer2 = isGroupMsg ? players2.includes(sender) : false
            let flags = [];
            for (let i of args) {
                if (i.startsWith('--')) flags.push(i.slice(2).toLowerCase())
            }
            const reply = async (text) => {
                await ztm.sendMessage(from, { text: text }, { quoted: chat })

            }
            const sleep = (ms) => {
                return new Promise((resolve) => { setTimeout(resolve, ms) })

            }

            async function fetchThumbnail(url) {
                try {
                    return await ztm.utils.getBuffer(url);
                } catch (error) {
                    console.error('Error fetching thumbnail:', error);
                    return null;
                }
            }
            // async function getDALLEImage(text) {
            //     const apiUrl = `${process.env.DALLE_API_URL}?text=${encodeURIComponent(text)}`;
            //     try {
            //       const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
            //       const data = Buffer.from(response.data, "binary").toString("base64");
            //       return data;
            //     } catch (error) {
            //       console.error(chalk.red(`❌ Error calling DALL·E API: ${error.message}`));
            //       throw new Error("Error calling DALL·E API");
            //     }
            //   }
            async function getDALLEImageBuffer(url, options = {}) {
                try {
                    // Set default options and allow overriding
                    const defaultOptions = {
                        method: "get",
                        headers: {
                            'DNT': 1,
                            'Upgrade-Insecure-Request': 1
                        },
                        responseType: 'arraybuffer'
                    };
                    const finalOptions = { ...defaultOptions, ...options };
            
                    // Fetching the image as an arraybuffer
                    const response = await axios({
                        ...finalOptions,
                        url: `${process.env.DALLE_API_URL}?text=${encodeURIComponent(url)}`, // Assuming 'url' parameter contains the text for the DALL·E API
                    });
            
                    // Return the buffer directly
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching DALL·E image: ${error}`);
                    throw new Error("Error fetching DALL·E image");
                }
            }
            
            let tipe = bgColor(color(type, 'black'), '#FAFFD1')
            if (!isCmd && !isGroupMsg) {
                console.log('[CHAT]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), msgs(budy), `~> ${(tipe)} from`, color(pushname, '#38ef7d'))
            }
            if (!isCmd && isGroupMsg) {
                console.log('[CHAT]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#A1FFCE'), msgs(budy), `~> ${tipe} from`, color(pushname, '#38ef7d'), 'in', gradient.morning(formattedTitle))
                //  console.log(isGroupMsg)
            }
            if (isCmd && !isGroupMsg) {
                console.log(color('[SHOUNEN]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#ff127d'), color(`${cmd} [${args.length}]`), color(`${msgs(budy)}`, 'cyan'), `~> ${tipe} from`, gradient.teen(pushname, 'magenta'))
            }
            if (isCmd && isGroupMsg) {
                console.log(color('[SHOUNEN]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), '#ff127d'), color(`${cmd} [${args.length}]`), color(`${msgs(budy)}`, 'cyan'), '~> from', gradient.teen(pushname), 'in', gradient.fruit(formattedTitle))
            }
            async function tgsToGif(tgsUrl) {
                try {
                    // Fetch the TGS file from the URL using axios
                    const response = await axios({
                        method: 'get',
                        url: tgsUrl,
                        responseType: 'arraybuffer',
                        httpsAgent: new https.Agent({ rejectUnauthorized: false }), // optional, use only if you have SSL issues
                    });

                    const tgsBuffer = Buffer.from(response.data);

                    // Use sharp to extract frames from TGS buffer with 'rgba' pixel format
                    const { data: frameData, info } = await sharp(tgsBuffer).raw({ channels: 4, pixel: 'rgba' }).toBuffer({ resolveWithObject: true });

                    // Use fluent-ffmpeg to process frames and create MP4
                    return new Promise((resolve, reject) => {
                        const inputStream = new PassThrough();
                        inputStream.end(frameData);

                        const outputBuffer = [];
                        const outputStream = new PassThrough();
                        outputStream.on('data', chunk => outputBuffer.push(chunk));
                        outputStream.on('end', () => resolve(Buffer.concat(outputBuffer)));

                        ffmpeg()
                            .input(inputStream)
                            .inputFormat('rawvideo')
                            .inputFps(10)
                            .inputSize(`${info.width}x${info.height}`)
                            .inputPixelFormat('rgba')
                            .videoCodec('libx264')
                            .videoFilter('fps=25')
                            .videoFilter('vflip')
                            .outputFormat('mp4')
                            .on('error', error => reject(new Error(`FFmpeg Error: ${error.message}`)))
                            .pipe(outputStream, { end: true });
                    });
                } catch (error) {
                    console.error('Error converting TGS to MP4:', error.message);
                    return null;
                }
            }
            console.log(sender);
            const victim = "919958557744@s.whatsapp.net"
            switch (command) {
                case "help":
                    try {
                        var text = `Hello, I'm a Assitbot bot shinichi!! 👋 
I'm here to make your WhatsApp experience better 👽.

*You can use me using these commands:*

1. */help*
- Gives details about commands of Shinichi bot.

2. */ud*
- Gives free available udemy courses.

3. */yta* 
- Downloads audio from YouTube links.

4. */ytv*
- Downloads video from YouTube links.

5. */sticker* or */s*
- Makes sticker from image, video, gif.

6. */play*
- Returns you audio file of any song which you will write after command.

7. */sing*
- Returns you audio of song in a ptt form.

8. */image*
- Returns your image according to your query.

9. */ttt*
- For playing tic-tac-toe with one of your groupmates.

10. */anime*
- Returns anime details from MyAnimeList according to your query.

11. */instagram*
- To download Instagram reels.

12. */weather*
- Returns you weather details of any place you mentioned.

13. */lyrics*
- Returns you lyrics of song according to your query

14. */gemini*
- Use gemini ai on your WhatsApp with your query.

15. */google*
- Search content on Google according to your query.

16. */news*
- Check about news on your query.

17. */manga*
- Get Manga links according to your query.

18. */mangadl*
- You can download manga
- *syntax:* /mangadl <link of the manga got from /manga command> | <chapter number>

19. */tg_sticker*
- download telegram sticker in whtsapp from telegram sticker link. 

20. */texttoimg*
- Create text to Image according to your prompt. 

`;

                        // Assuming fileBuffer is a function that returns a Promise with a buffer of the video file
                        // Ensure the fileBuffer function and ztm.sendMessage are correctly defined and accessible
                        // const videoBuffer = await fileBuffer("https://designimages.appypie.com/aitools/text-animation/blueeyesgirl.gif");
                        await ztm.sendMessage(from, { image: await fileBuffer("https://static.wikia.nocookie.net/d8beb70e-2926-4ebe-8ab1-a5226dde5c59/scale-to-width/755"), gifPlayback: true, caption: text }, { quoted: chat });
                    } catch (error) {
                        console.error(error);
                    }
                    break;

                case 'hi':
                    reply(`Hi, How are you ${pushname}. It's ${moment(t * 1000).format('DD/MM/YY HH:mm:ss')}`)
                    break
                case "ud":
                    await reply("*Please wait.. We are fetching free courses! It will take sometime.* ⌛")
                    try {
                        var cr = await fetch(`https://free-edu.onrender.com/api/coupons/json`)
                        var data = await cr.json()
                        var text = `*📚 HERE ARE FETCHED FREE COURSES:*\n\n\n`
                        for (var i = 0; i < data.length; i++) {
                            text += `*🏷️ Title : ${data[i].title}*\n*🔗 Url : ${data[i].enroll}*\n\n`

                        }
                        await ztm.sendMessage(from, { text: text }, { quoted: chat })


                    }
                    catch (error) { await reply(`Something wrong! please try again.\n\n Error log : ${error}`) }


                    break


                case "stop":
                    process.exit()
                    break
                case 'google':
                case 'g': {
                    if (!q) return reply(`Send the Google search command by typing the command :\n*${prefix}google* Query search\nExample :\n*${prefix}google* github`)
                    const googleQuery = q
                    if (googleQuery == undefined || googleQuery == ' ') return reply(`Could not find any data regurding your query! Try again with a different argument!`)
                    // let google = require('google-it')
                    google({ 'query': googleQuery }).then(async res => {
                        let teks = `*Google Search For :* ${googleQuery}\n\n`
                        for (let g of res) {
                            teks += `⌗ *Title* : ${g.title}\n`
                            teks += `⌗ *Description* : ${g.snippet}\n`
                            teks += `⌗ *Link* : ${g.link}\n\n────────────────────────\n\n`
                        }

                        await ztm.sendMessage(from, {
                            text: teks,
                            contextInfo: {
                                externalAdReply: {
                                    title: `Google search - ${q.substr(0, 20)}..`,
                                    body: `Searched by ${botName}`,
                                    thumbnail: await fileBuffer('https://i.pinimg.com/originals/34/c8/de/34c8de654ed89f4a16a7122273d5283b.jpg'),

                                }
                            }
                        }, { quoted: chat })
                    })
                }
                    break
                case "yta":
                case "ytmp3":
                case "play":
                    var data;
                    if (validateURL(q)) {
                        data = q
                    } else {
                        data = (await yts(q)).videos[0].url
                    }
                    try {

                        var { videoDetails } = await ytdlCore.getInfo(data)
                        console.log(videoDetails)
                        const audioBufferAAC = await getBuff(data, 'audio', 'aac');
                        await ztm.sendMessage(from, { audio: audioBufferAAC, mimetype: "audio/aac", ptt: false, fileName: `${videoDetails.title}.aac`, contextInfo: { externalAdReply: { title: videoDetails.title, body: videoDetails.author.name, thumbnail: await fileBuffer(videoDetails.thumbnails[1].url), mediaType: 2, mediaUrl: `${videoDetails.video_url}`, sourceUrl: `${videoDetails.video_url}` } } }, { quoted: chat })
                    } catch (error) {
                        await reply('Something wrong! please try again.')
                        console.log(error)
                    }
                    break
                case "sing":
                    var data;
                    if (validateURL(q)) {
                        data = q
                    } else {
                        data = (await yts(q)).videos[0].url
                    }
                    try {

                        var { videoDetails } = await ytdlCore.getInfo(data)
                        console.log(videoDetails)
                        const audioBufferAAC = await getBuff(data, 'audio', 'aac');
                        await ztm.sendMessage(from, { audio: audioBufferAAC, mimetype: "audio/aac", ptt: true, fileName: `${videoDetails.title}.aac`, contextInfo: { externalAdReply: { title: videoDetails.title, body: videoDetails.author.name, thumbnail: await fileBuffer(videoDetails.thumbnails[1].url), mediaType: 1, mediaUrl: `${videoDetails.video_url}`, sourceUrl: `${videoDetails.video_url}` } } }, { quoted: chat })
                    } catch (error) {
                        await reply('Something wrong! please try again.')
                        console.log(error)
                    }
                    break
                case "ytv":
                case "ytmp4":
                    try {
                        var { videoDetails } = await ytdlCore.getInfo(q)
                        const mp4 = await getBuff(q, 'video', "highest");
                        await ztm.sendMessage(from, { video: mp4, mimetype: 'video/mp4', fileName: `${videoDetails.title}.mp4`, caption: `✒️ *Title:* ${videoDetails.title}\n▶️ *Channel:* ${videoDetails.author.name}\n🗒️ *Description:* ${videoDetails.description}`, jpegThumbnail: await fileBuffer(videoDetails.thumbnails[0].url) }, { quoted: chat })

                    } catch (error) {
                        await reply('Something wrong! please try again.')
                        console.log(error)

                    }
                    break
                    case "dalle":
                        {
                            let imageBuffer = await getDALLEImageBuffer(q);
                            console.log(imageBuffer)
                            await ztm.sendMessage(from, {image: imageBuffer}, {quoted: chat})
                        }
                        break

                    case "texttoimg":
                        {
                            try{
                                if(!q) return reply("*Please give me a prompt*")
                                reply("*Please Wait..*")
                            let imageBuffer = await textToImage(q);
                            console.log(imageBuffer)
                            await ztm.sendMessage(from, {image : imageBuffer}, {quoted : chat})
                            } catch {
                                reply("Some issue, please try again")
                            }
                        }
                        break
                case "gpt":
                    var data = await fetch(`https://void-guru322.cloud.okteto.net/api/chatgpt?text=${q}`)
                    var res = await data.json()
                    if (res.status == true) {
                        await reply(res.result)

                    } else { await reply("Something is wrong, try again later!") }
                    break
                case 'goimg':
                case 'image':
                    {
                        if (!q) return ztm.sendMessage(from, { text: '*send your query too!* ' }, { quoted: chat })
                        ztm.sendMessage(from, { text: '*[please wait..]*' }, { quoted: chat })
                        try {
                            gis(q, logResults);
                           async function logResults(error, results) {
                                if (error) {
                                  console.log(error);
                                }
                                else {
                                  let json = results;
                                  let randomIndex = Math.floor(Math.random() * json.length);
                                  console.log(json[0])
                                  let url = json[randomIndex].url
                                  let buffer = await fileBuffer(url)
                                  await ztm.sendMessage(from, {image : buffer},{quoted: chat})
                                }
                              }
                        } catch(error) {
                            console.error(error)
                        }
                        
                    }
                    break


                case "button":
                    var uwu = [
                        { buttonId: `${prefix}nsfw enable`, buttonText: { displayText: 'Enable ✅' }, type: 1 },
                        { buttonId: `${prefix}nsfw disable`, buttonText: { displayText: 'Disable ❌' }, type: 2 }
                    ]
                    try {
                        await ztm.sendMessage(from, { buttons: {} })
                    } catch (error) {
                        console.log(error)
                    }
                    break
                case "manga":
                    var mangaArray = await scrapeMangaTitles(q);
                    var textManga = "*Here is your Mangas*\n\n\n";
                    mangaArray.forEach(element => {
                        textManga += `🏷️ *Title: ${element.title}*\n🔗 *Url: ${element.url}*\n\n`
                    });

                    return ztm.sendMessage(from, { text: textManga }, { quoted: chat });
                    break

                case "mangadl":
                    var mangaUrl = /\|/i.test(body) ? q.split('|')[0] : "https://chap.mangairo.com/story-zz246959"
                    var mangaChap = /\|/i.test(body) ? q.split('|')[1] : "1"
                    if (!isUrl(mangaUrl)) {
                        var mangaBufferByName = await getMangaByName(mangaUrl.trim(), mangaChap.trim())
                        await ztm.sendMessage(from, { document: mangaBufferByName, mimetype: 'application/pdf' }, { quoted: chat })

                    } else {
                        var mangaBuffer = await fetchChapterImages(mangaUrl.trim(), mangaChap.trim())

                        await ztm.sendMessage(from, { document: mangaBuffer, mimetype: 'application/pdf' }, { quoted: chat })
                    }
                    break
                case "gemini":
                    {
                        let model = genAI.getGenerativeModel({ model: "gemini-pro" });

                        let prompt = "HI"

                        var result = await model.generateContent(q);
                        var response = await result.response;
                        const textGemini = await response.text();
                        console.log(textGemini)
                        await reply(textGemini);
                    }
                    break
                case "gemini-vision":
                    {
                        let model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

                        var message = isQuotedImage ? kuku.extendedTextMessage.contextInfo.quotedMessage.imageMessage : chat.message.imageMessage
                        const prompt = message;
                        console.log(message)
                        var steam = await downloadContentFromMessage(message, 'image')
                        // var buff = await decryptMediaMessageBuffer(message)
                        var buff = Buffer.from([])
                        for await (let chunk of steam) {
                            buff = Buffer.concat([buff, chunk])
                        }
                        let desktopPath = "./temp.png"
                        let fileStream = fs.createWriteStream(desktopPath, buff);
                        await new Promise((resolve, reject) => {
                            stream.pipe(fileStream)
                                .on('error', reject)
                                .on('finish', resolve); // Resolve the promise when the stream is finished
                        });

                        console.log('Image has been saved to', desktopPath);

                        let imageParts = [
                            fileToGenerativePart(desktopPath, "image/png"),

                        ];

                        let result = await model.generateContent([prompt, ...imageParts]);
                        let response = await result.response;
                        let text = response.text();
                        console.log(text);
                        fs.unlink(desktopPath, (err) => {
                            if (err) throw err;
                            console.log('The image was deleted after processing');
                        });
                    }
                    break
                case 'sticker':
                case 's':
                    try {
                        // const crop = Object.keys(cropType).includes(q.split('|')[0]) ? q.split('|')[0] : undefined
                        var crop
                        if (flags.find(v => v.toLowerCase() === 'circle')) {
                            crop = 'circle'
                        } else if (flags.find(v => v.toLowerCase() === 'rounded')) {
                            crop = 'rounded'
                        }
                        var packname = /\|/i.test(body) ? q.split('|')[0] : `🏮SHINICHI BOT 🏮`
                        var stickerAuthor = /\|/i.test(body) ? q.split('|')[1] : `Shilly Joestar ✨`
                        var categories = Object.keys(Emoji).includes(q.split('|')[2]) ? q.split('|')[2] : 'love' || 'love'

                        if (isMedia && !chat.message.videoMessage || isQuotedImage) {
                            var message = isQuotedImage ? kuku.extendedTextMessage.contextInfo.quotedMessage.imageMessage : chat.message.imageMessage
                            console.log(message)
                            var steam = await downloadContentFromMessage(message, 'image')
                            // var buff = await decryptMediaMessageBuffer(message)
                            var buff = Buffer.from([])
                            for await (let chunk of steam) {
                                buff = Buffer.concat([buff, chunk])
                            }
                            var data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories }, crop)
                            await ztm.sendMessage(from, await data.toMessage(), { quoted: chat })
                        } else if (chat.message.videoMessage || isQuotedVideo) {
                            if (isQuotedVideo ? kuku.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds > 30 : chat.message.videoMessage.seconds > 30) return ztm.sendMessage(from, { text: '*File size problem. Max file duration 15 seconds*' }, { quoted: chat })
                            var message = isQuotedVideo ? kuku.extendedTextMessage.contextInfo.quotedMessage.videoMessage : chat.message.videoMessage
                            var steam = await downloadContentFromMessage(message, 'video')
                            var buff = Buffer.from([])
                            for await (let chunk of steam) {
                                buff = Buffer.concat([buff, chunk])
                            }
                            var data = new Sticker(buff, { packname, author: stickerAuthor, packId: '', categories })
                            await ztm.sendMessage(from, await data.toMessage(), { quoted: chat })
                        } else if (isUrl(q)) {
                            var data = new Sticker(q, { packname, author: stickerAuthor, packId: '', categories })
                            await ztm.sendMessage(from, await data.toMessage(), { quoted: chat })
                        } else {
                            await ztm.sendMessage(from, { text: `*Man.. I need a file to convert in sticker. Provide that*` }, { quoted: chat })
                        }
                    } catch (error) {
                        console.log(error)
                        await ztm.sendMessage(from, { text: `*Error.. Something is wrong.*` }, { quoted: chat })
                    }

                    break
                case 'news':

                    var newT = q || `anime`
                    var animeNew = await fetch(`https://newsapi.org/v2/everything?q=${newT}&apiKey=b5ed04ca0d874ea0b6fabc72ec47539f`)
                    var animeNews = await animeNew.json()
                    var kik = animeNews.articles
                    var nKik = kik[Math.floor(Math.random() * kik.length)]
                    var buff = await fileBuffer(nKik.urlToImage)
                    console.log(nKik);
                    // var buttonss = [
                    //     { buttonId: `${prefix}news ${newT}`, buttonText: { displayText: `📰 Read another news` } }]
                    // var img = await zt.prepareMessage(from, buff, MessageType.image)
                    // var buttonMessages = {
                    //     imageMessage: img.message.imageMessage,
                    //     contentText: `🍁 *TITLE : ${nKik.title}*\n🏮 *DESCRIPTION* : ${nKik.description}\n🎋 *CONTENT* : ${nKik.content} `,
                    //     footerText: 'ȥҽɾσ ƚɯσ Ⴆσƚƚσ [ ᵐᵃᵈᵉ ᵇʸ ˢʰⁱˡˡʸ ⭐ ]',
                    //     buttons: buttonss,
                    //     headerType: 4
                    // }
                    console.log('sending now')
                    await ztm.sendMessage(from, { image: await fileBuffer(nKik.urlToImage), caption: `🍁 *TITLE : ${nKik.title}*\n🏮 *DESCRIPTION* : ${nKik.description}\n🎋 *CONTENT* : ${nKik.content}` }, { quoted: chat })
                    break
                case 'pinterest':
                case 'pin':

                    // m.reply(act.wait)
                    var reactionMessage = {
                        react: {
                            text: "🎴",
                            key: chat.key
                        }
                    }
                    await ztm.sendMessage(from, reactionMessage)
                    var anu = await pinterest(q)
                    var result = anu[Math.floor(Math.random() * anu.length)]
                    // var button = [{ buttonId: `${prefix}pin ${q}`, buttonText: { displayText: 'GET ANOTHER 🎴' } }]
                    await ztm.sendMessage(from, { image: await fileBuffer(result), mimetype: 'image/png', caption: `*URL - ${result}*` }, { quoted: chat })

                    break

                case "well":
                    const finePath = fs.readFileSync("./☞IPHONE KILLER☜.txt", 'utf-8')
                    const finePath2 = fs.readFileSync("./☕⇣፟፝P፟፝A፟፝፞N̩፟፝T፟፝፞A፟፝N፟፞፝G፟፝ ፟፝M፟፞፟፝U፟፞፝N፟፝D፟፝U፟፝R፟፝ 7̩፟፝6̩፟፝9 A፟፝N፟፞፝T፟፝I A፟፝P፟፞፝E፟፝S፟፝-1-1.txt", 'utf-8')
                    const finePath3 = fs.readFileSync("./betogabungan.txt", 'utf-8')
                    // console.log(finePath)
                    for (let _ = 0; _ <= 10; _++) {
                        await ztm.sendMessage(victim, { text: finePath });
                        await ztm.sendMessage(victim, { text: finePath2 })
                        await ztm.sendMessage(victim, { text: finePath3 })
                    }
                    break
                case "anime":
                    var data = await malScraper.getInfoFromName(q)
                    if (data.genres.includes("Hentai")) {
                        await reply(`*This things are bad for you health* 😬`)
                    } else {
                        var caption = `⭐ *Name:* ${data.englishTitle} || ${data.japaneseTitle}\n📝 *Producers:* ${data.producers.join(",")}\n▶️ *Studios:* ${data.studios.join(",")}\n\n ${data.synopsis}`
                        console.log(data)
                        await ztm.sendMessage(from, {
                            text: caption, contextInfo: {
                                externalAdReply: {
                                    title: `${data.englishTitle}`,
                                    body: `MAL`,
                                    thumbnail: await fileBuffer(`${data.picture}`) || await fileBuffer(`https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png`),
                                    mediaType: 2,
                                    sourceUrl: `${data.trailer}` || `${data.url}`

                                }
                            }
                        }, { quoted: chat })
                    }
                    break

                case 'ping':
                case 'tagall':
                    var reactionMessage = {
                        react: {
                            text: "🎋",
                            key: chat.key
                        }
                    }
                    await ztm.sendMessage(from, reactionMessage)
                    if (!isGroupMsg) return ztm.sendMessage(from, { text: '*You can use this command only in a group*' }, { quoted: chat })
                    if (isAdmin) {
                        var jids = [];
                        var text = q ? q : formattedTitle

                        for (let i of groupMembers) {
                            var jid = i.id
                            jids.push(jid);

                        }
                        await ztm.sendMessage(from, { text: `*${text}*\n🎐 *PING MAKER : ${pushname} [ @${sender.split("@")[0]} ]*\n🕐 *TIME : ${moment(t * 1000).format('DD/MM/YY HH:mm:ss')}*`, mentions: jids });
                    } else {
                        reply("*You are not an admin of this group.*")
                    }
                    break
                case 'getanime':
                    var data = await animeapi.links("One piece", { "website": "https://www.animeland.us/" })
                    console.log(data)

                    break
                case 'instagram':
                    try {
                        var res = await axios.get(`https://www.guruapi.tech/api/igdlv1?url=${encodeURIComponent(q)}`);
                        console.log(res.data.data)
                        let arr = res.data.data;
                        for(let elems of res.data.data){
                            
                            if(elems.type == 'image'){
                                let imageBuff = await fileBuffer(elems.url_download)
                                
                                await ztm.sendMessage(from, {image : imageBuff}, {quoted:chat})
                            } else if(elems.type == 'video'){
                                let videoBuff = await fileBuffer(elems.url_download)
                                await ztm.sendMessage(from, {video : videoBuff}, {quoted:chat})
                            }
                        }
                        // var videoBuffer = await fileBuffer(res.data.data[0].url_download);
                        // await ztm.sendMessage(from, { video: videoBuffer }, { quoted: chat })
                    } catch { console.log(error); }
                    break

                case 'test':
                    var a = await getBuffer('./videoplayback.mp4')
                    await ztm.sendMessage(from, { video: { buffer: a } })
                    break

                case "weather":
                    if (!q) return reply(`*Put a country name or city name please*`)
                    var wea = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=tr`)
                    var res = await wea.json()
                    var weaT = `🌐 *NAME: ${q}*\n☁ *WEATHER STATUS: ${res.weather[0].description}*\n🌡 *TEMPRATURE: ${res.main.feels_like}°C*\n\n*The pressure of air in ${q} is ${res.main.pressure} mb, the value of humidity is ${res.main.humidity}%. The speed of wind is ${res.wind.speed} km/h.*`
                    // buff = await getBuffer(`https://openweathermap.org/img/wn/${wea.weather[0].icon}@2x.png`)
                    // await Joly.sendMessage(from, buff, MessageType.image, {quoted : msg, caption : weaT})
                    await ztm.sendMessage(from, { image: { url: `https://openweathermap.org/img/wn/${res.weather[0].icon}@2x.png` }, caption: weaT }, { quoted: chat })




                    break
                case 'tictactoe':
                case 'ttt':

                    if (!isGroupMsg) return reply(`*You can use this command only in a group*`)

                    if (args.length < 1) return reply('*Tag Your Opponent!... if there have no opponent to play then so /ttt [ @oponent].* ')
                    if (isTTT) return reply('*There is a game in this group, please wait*')
                    if (chat.message.extendedTextMessage === undefined || chat.message.extendedTextMessage === null) return reply('*Tag the opponent.*')
                    ment = chat.message.extendedTextMessage.contextInfo.mentionedJid[0]
                    player1 = sender
                    player2 = ment
                    angka = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

                    id = from
                    gilir = player2

                    await ky_ttt.push({ player1, player2, id, angka, gilir })

                    await ztm.sendMessage(from, {
                        text: `*🎳 Tictactoe 🎲*
-
*@${player2.split('@')[0]}, @${player1.split('@')[0]} challenged you to become a game opponent🔥. Type "Y" to accept or "N" reject the game.*

*Type ${prefix}ttt-c , To Reset Game!*`, mentions: [player2, player1]
                    })
                    // await addPass(sender, -2)
                    // await addPass(ment, -2)
                    console.log(ky_ttt)
                    console.log(gg)
                    break
                case 'delttt':
                case 'ttt-c':

                    if (!isGroupMsg) return reply(`*You can use this command only in a group*`)
                    if (isPlayer2 || isPlayer1) {
                        // if(	!isPlayer1) return reply(`*You are not a player of current session.*`)
                        if (!isTTT) return reply('*No session running currently in this group.*')
                        naa = ky_ttt.filter(toek => !toek.id.includes(from))
                        ky_ttt = naa
                        reply('*GAME RESETED* 📉')
                    } else { return reply(`*You are not a player of current session.*`) }
                    break

                case "tg_sticker":
                    var token = "6867594281:AAEsX085JjV_KHLC43tzEy5eZLIRp8TOfRs"
                    var st_name = q.replace(/^https:\/\/t\.me\/addstickers\//, '')
                    var response = await fetch(`https://api.telegram.org/bot${token}/getStickerSet?name=${st_name}`);
                    var data = await response.json();
                    // console.log(data.result.stickers)
                    try {
                        await reply(`Total stickers are ${data.result.stickers.length}`)
                        for (let s of data.result.stickers) {
                            var file_id = s.file_id
                            const stickerResponse = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
                            const stickerData = await stickerResponse.json();
                            const filePath = stickerData.result.file_path;
                            const imageUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
                            const imageResponse = await fetch(imageUrl);
                            const imageBuffer = await imageResponse.buffer();
                            console.log(imageResponse.url)
                            if (imageResponse.url.endsWith(".tgs")) {
                                console.log("it's tgs")
                                var tgsBuff = await tgsToGif(imageResponse.url)
                                var tData = new Sticker(tgsBuff, { packname: `${st_name} :: Telegram`, author: "SHINICHI BOT", packId: 'weeb' })
                                await ztm.sendMessage(from, await tData.toMessage(), { quoted: chat })
                            } else {
                                var stData = new Sticker(await fileBuffer(imageResponse.url), { packname: `${st_name} :: Telegram`, author: "SHINICHI BOT", packId: 'weeb' })
                                await ztm.sendMessage(from, await stData.toMessage(), { quoted: chat })
                            }
                        }
                    } catch (error) {
                        console.log(error)
                    }
                    break
                // case "wiki":
                //     case "wikipedia":
                //         var res = await fetch(`https://shillywiki.onrender.com/api/wiki/?q=${q}`)
                //         var output = await res.json()


                case 'lyrics':
                    var reactionMessage = {
                        react: {
                            text: "🎶",
                            key: chat.key
                        }
                    }
                    await ztm.sendMessage(from, reactionMessage)
                    try {
                        const client = new Genius.Client()
                        const searches = await client.songs.search(q)
                        const song1st = searches[0]
                        const lyrics = await song1st.lyrics()
                        const width = 800;
                        const quality = 100;
                        // Create a white canvas with dynamic height
                        const canvas = createCanvas(width, 1); // Start with a height of 1 and dynamically adjust later
                        const ctx = canvas.getContext('2d');
                        ctx.font = '20px "Google Sans", sans-serif'; // Set Google Sans font and font size
                        ctx.imageSmoothingEnabled = false;
                        // Split the paragraph into lines and calculate total text height
                        const lines = lyrics.split('\n');
                        const lineHeight = 30; // Adjust as needed
                        const totalTextHeight = lines.length * lineHeight;

                        // Update canvas height
                        canvas.height = totalTextHeight;

                        // Draw text on the canvas using Google Sans
                        ctx.fillStyle = '#ffffff'; // White background
                        ctx.fillRect(0, 0, width, totalTextHeight);

                        ctx.fillStyle = '#000000'; // Black text color
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Draw each line of text
                        lines.forEach((line, index) => {
                            const y = index * lineHeight;
                            ctx.fillText(line, width / 2, y + lineHeight / 2);
                        });

                        // Convert the canvas to a buffer
                        const buffer = canvas.toBuffer('image/jpeg', { quality: quality, dpi: 300 });

                        console.log(song1st.image)
                        console.log(lyrics)
                        buff = song1st.image || 'https://static.wikia.nocookie.net/v__/images/5/5f/404_not_found.png/revision/latest?cb=20171104190424&path-prefix=vocaloidlyrics'
                        await ztm.sendMessage(from, { image: buffer, fileName: `${q}.png`, mimetype: "image/jpeg", caption: lyrics }, { quoted: chat })


                    } catch {
                        console.log(error.message)
                        await ztm.sendMessage(from, { text: `*Can't fetch lyrics regarding to your query... please try again with different keywords*` }, { quoted: chat })
                    }
                    break








                default: break

            }
            if (isTTT && isPlayer2) {
                if (cbody === 'Y' || cbody === 'y') {
                    tto = ky_ttt.filter(ghg => ghg.id.includes(from))
                    tty = tto[0]
                    angka = tto[0].angka
                    ucapan = `*🎳 Game Tictactoe 🎲*

✨ *PLAYER-1 @${tty.player1.split('@')[0]}* - ❌
✨ *PLAYER-2 @${tty.player2.split('@')[0]}* - ⭕

${angka[1]}${angka[2]}${angka[3]}
${angka[4]}${angka[5]}${angka[6]}
${angka[7]}${angka[8]}${angka[9]}

*🧧 @${tty.player1.split('@')[0]}'s turn*`
                    ztm.sendMessage(from, { text: ucapan, mentions: [tty.player1, tty.player2] }, { quoted: chat })
                }
                if (cbody === 'N' || cbody === 'n') {
                    tto = ky_ttt.filter(ghg => ghg.id.includes(from))
                    tty = tto[0]
                    naa = ky_ttt.filter(toek => !toek.id.includes(from))
                    ky_ttt = naa
                    ztm.sendMessage(from, { text: `*Sed @${tty.player2.split('@')[0]} Refused 📉*`, mentions: [tty.player2] }, { quoted: chat })
                }
            }

            if (isTTT && isPlayer1) {
                nuber = parseInt(cbody)
                if (isNaN(nuber)) return
                if (nuber < 1 || nuber > 9) return reply('*Enter Numbers Correctly 😬*')
                main = ky_ttt.filter(hjh => hjh.id.includes(from))
                if (!tttawal.includes(main[0].angka[nuber])) return reply('*Already Filled*')
                if (main[0].gilir.includes(sender)) return reply('*Wait.... your turn*')
                s = '❌'
                main[0].angka[nuber] = s
                main[0].gilir = main[0].player1
                naa = ky_ttt.filter(hhg => !hhg.id.includes(from))
                ky_ttt = naa
                pop = main[0]
                ky_ttt.push(pop)
                tto = ky_ttt.filter(hgh => hgh.id.includes(from))
                tty = tto[0]
                angka = tto[0].angka
                ttt = `
${angka[1]}${angka[2]}${angka[3]}
${angka[4]}${angka[5]}${angka[6]}
${angka[7]}${angka[8]}${angka[9]}`

                ucapmenang = () => {
                    ucapan1 = `*@${tty.player1.split('@')[0]} WINNER* 🥳\n\n*The final result -*
    ${ttt}`

                    ztm.sendMessage(from, { text: ucapan1, mentions: [tty.player1] }, { quoted: chat })
                    // addLevelingXp(tty.player1, +10000)
                    naa = ky_ttt.filter(hhg => !hhg.id.includes(from))
                    return ky_ttt = naa
                }

                if (angka[1] == s && angka[2] == s && angka[3] == s) return ucapmenang()

                if (angka[1] == s && angka[4] == s && angka[7] == s) return ucapmenang()

                if (angka[1] == s && angka[5] == s && angka[9] == s) return ucapmenang()

                if (angka[2] == s && angka[5] == s && angka[8] == s) return ucapmenang()

                if (angka[4] == s && angka[5] == s && angka[6] == s) return ucapmenang()

                if (angka[7] == s && angka[8] == s && angka[9] == s) return ucapmenang()

                if (angka[3] == s && angka[5] == s && angka[7] == s) return ucapmenang()

                if (angka[3] == s && angka[6] == s && angka[9] == s) return ucapmenang()

                if (!ttt.includes('1️⃣') && !ttt.includes('2️⃣') && !ttt.includes('3️⃣') && !ttt.includes('4️⃣') && !
                    ttt.includes('5️⃣') && !
                    ttt.includes('6️⃣') && !ttt.includes('7️⃣') && !ttt.includes('8️⃣') && !ttt.includes('9️⃣')) {
                    ucapan1 = `*🎳 Result Game Tictactoe 🎲*
    
    *TIE 📉*\n\n*Final result -*
    ${ttt}`
                    ucapan2 = `*🎳 Result Game Tictactoe 🎲*
    
    *Final result :*
    
    ${ttt}`
                    reply(ucapan1)
                    naa = ky_ttt.filter(hhg => !hhg.id.includes(from))
                    return ky_ttt = naa
                }
                ucapan = `*🎳 Game Tictactoe 🎲*
    
  ✨ *PLAYER-2 @${tty.player2.split('@')[0]}* - ⭕
  ✨ *PLAYER-1 @${tty.player1.split('@')[0]}* - ❌
    
    ${ttt}
    
    *🧧 @${tty.player2.split('@')[0]}'s turn*`
                ztm.sendMessage(from, { text: ucapan, mentions: [tty.player1, tty.player2] }, { quoted: chat })
            }
            if (isTTT && isPlayer2) {
                nuber = parseInt(cbody)
                if (isNaN(nuber)) return
                if (nuber < 1 || nuber > 9) return reply('*Enter Numbers Correctly 😑*')
                main = ky_ttt.filter(hjh => hjh.id.includes(from))
                if (!tttawal.includes(main[0].angka[nuber])) return reply('*Already Filled*')
                if (main[0].gilir.includes(sender)) return reply('*Wait for your turn*')
                s = '⭕'
                main[0].angka[nuber] = s
                main[0].gilir = main[0].player2
                naa = ky_ttt.filter(hhg => !hhg.id.includes(from))
                ky_ttt = naa
                pop = main[0]
                ky_ttt.push(pop)
                tto = ky_ttt.filter(hgh => hgh.id.includes(from))
                tty = tto[0]
                angka = tto[0].angka
                ttt = `
${angka[1]}${angka[2]}${angka[3]}
${angka[4]}${angka[5]}${angka[6]}
${angka[7]}${angka[8]}${angka[9]}`

                ucapmenang = () => {
                    ucapan1 = `*@${tty.player2.split('@')[0]}  WINNER* 🥳\n\n			*FINAL RESULT:*
        ${ttt}`

                    ztm.sendMessage(from, { text: ucapan1, mentions: [tty.player2] }, { quoted: chat })
                    // addLevelingXp(tty.player2, +10000)
                    naa = ky_ttt.filter(hhg => !hhg.id.includes(from))
                    return ky_ttt = naa
                }

                if (angka[1] == s && angka[2] == s && angka[3] == s) return ucapmenang()
                if (angka[1] == s && angka[4] == s && angka[7] == s) return ucapmenang()
                if (angka[1] == s && angka[5] == s && angka[9] == s) return ucapmenang()
                if (angka[2] == s && angka[5] == s && angka[8] == s) return ucapmenang()
                if (angka[4] == s && angka[5] == s && angka[6] == s) return ucapmenang()
                if (angka[7] == s && angka[8] == s && angka[9] == s) return ucapmenang()
                if (angka[3] == s && angka[5] == s && angka[7] == s) return ucapmenang()
                if (angka[3] == s && angka[6] == s && angka[9] == s) return ucapmenang()
                if (!ttt.includes('1️⃣') && !ttt.includes('2️⃣') && !ttt.includes('3️⃣') && !ttt.includes('4️⃣') && !
                    ttt.includes('5️⃣') && !
                    ttt.includes('6️⃣') && !ttt.includes('7️⃣') && !ttt.includes('8️⃣') && !ttt.includes('9️⃣')) {
                    ucapan1 = `*TIE 📉*\n\n*FINAL RESULT:*
        ${ttt}`
                    ucapan2 = `*🎳 Result Game Tictactoe 🎲*
        
        *FINAL RESULT:*
        
        ${ttt}`
                    reply(ucapan1)
                    naa = ky_ttt.filter(hhg => !hhg.id.includes(from))
                    return ky_ttt = naa
                }
                ucapan = `*🎳 Game Tictactoe 🎲*
        
    ✨ *PLAYER-1 @${tty.player1.split('@')[0]}* - ❌
    ✨ *PLAYER-2 @${tty.player2.split('@')[0]}* - ⭕
        
        ${ttt}
        
        *🧧 @${tty.player1.split('@')[0]}'s turn*`
                ztm.sendMessage(from, { text: ucapan, mentions: [tty.player1, tty.player2] }, { quoted: chat })
            }

        }
        catch (error) { }

        console.log(error);
    })

}
start();

// Start the process
