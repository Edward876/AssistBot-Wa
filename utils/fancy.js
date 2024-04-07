const { S_WHATSAPP_NET, URL_REGEX } = require('@whiskeysockets/baileys');
const { randomBytes } = require('crypto');
const fs = require('fs')
const { sizeFormatter } = require('human-readable')
global.moment = require('moment-timezone');
const mime = require('mime-types');
moment.tz.setDefault('Asia/Kolkata');
const crypto = require('crypto')
const axios = require('axios')
const FormData = require('form-data')
const cheerio = require('cheerio')
const fetch = require('node-fetch');
const { Chalk } = require('cfonts/lib/Chalk');
const { PDFDocument } = require("pdf-lib");
const { HfInference } = require("@huggingface/inference"); 
const HF_TOKEN = process.env.HF_ACCESS_TOKEN;
const model = "stabilityai/stable-diffusion-xl-base-1.0";


const inference = new HfInference("hf_" + HF_TOKEN);

/**
 * Get text with color
 * @param  {String} text
 * @param  {String} color
 * @return  {String} Return text with color
 */
Chalk
const color = (text, color) => {
	return !color ? Chalk.green(text) : color.startsWith('#') ? Chalk.hex(color)(text) : Chalk.keyword(color)(text);
};

/**
 * coloring background
 * @param {string} text
 * @param {string} color
 * @returns
 */

async function textToImage(text){
	let result = await inference.textToImage({
		inputs: text,
		parameters: {
			negative_prompt: "text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality, watermark, unfinished, displeasing, oldest, early, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
			height: 1216,
			width: 832,
			num_inference_steps: 28,
			guidance_scale: 7,
		},
		model: model,
	});
	let arrayBuffer = await result.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
	return buffer;
}
function bgColor(text, color) {
	return !color
		? Chalk.bgGreen(text)
		: color.startsWith('#')
			? Chalk.bgHex(color)(text)
			: Chalk.bgKeyword(color)(text);
}
const fetchJson = (url, options) => new Promise(async (resolve, reject) => {
	fetch(url, options)
		.then(response => response.json())
		.then(json => {
			// console.log(json)
			resolve(json)
		})
		.catch((err) => {
			reject(err)
		})
})
/**
 * Get Time duration
 * @param  {Date} timestamp
 * @param  {Date} now
 */
const processTime = (timestamp, now) => {
	// timestamp => timestamp when message was received
	return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

/**
 * is it url?
 * @param  {String} url
 */
const isUrl = (url) => {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))

};

/**
 * cut msg length
 * @param {string} message 
 * @returns 
 */
const msgs = (message) => {
	if (message.length >= 20) {
		return `${message.substring(0, 500)}`;
	} else {
		return `${message}`;
	}
};

/**
 * @internal
 * A convinience method to download the [[DataURL]] of a file
 * @param input The url or path
 * @param optionsOverride You can use this to override the [axios request config](https://github.com/axios/axios#request-config)
 * @returns
 */
async function fileBuffer(url, options) {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}

const runtime = function (seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}
function pinterest(querry) {
	return new Promise(async (resolve, reject) => {
		axios.get('https://id.pinterest.com/search/pins/?autologin=true&q=' + querry, {
			headers: {
				"cookie": "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0"
			}
		}).then(({ data }) => {
			const $ = cheerio.load(data)
			const result = [];
			const hasil = [];
			$('div > a').get().map(b => {
				const link = $(b).find('img').attr('src')
				result.push(link)
			});
			result.forEach(v => {
				if (v == undefined) return
				hasil.push(v.replace(/236/g, '736'))
			})
			hasil.shift();
			resolve(hasil)
		})
	})
}
const makeExif = async (stiker, packname, author, categories = ['']) => {
	const webp = require('node-webpmux')
	const webpImg = new webp.Image();

	const stickerPackId = crypto.randomBytes(32).toString('hex')
	const json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': packname, 'sticker-pack-publisher': author, 'emojis': categories };
	let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
	let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
	let exif = Buffer.concat([exifAttr, jsonBuffer]);
	exif.writeUIntLE(jsonBuffer.length, 14, 4);
	await webpImg.load(stiker)
	webpImg.exif = exif
	return await webpImg.save(null)
}
async function getBuffer(input, optionsOverride = {}) {
	try {
		if (fs.existsSync(input)) {
			return {
				mimetype: mime.lookup(input),
				buffer: fs.readFileSync(input)
			}
		} else {
			const response = await axios.get(input, {
				responseType: 'arraybuffer',
				...optionsOverride,
			})
			return {
				mimetype: response.headers['content-type'],
				buffer: response.data,
			};
		}
		// return Buffer.from(response.data, 'binary').toString('base64')
	} catch (error) {
		console.log('TCL: getDUrl -> error', error);
	}
}

/**
 * Format bytes as human-readable text.
 * copied from -> https://stackoverflow.com/a/14919494
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si = true, dp = 1) {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	);

	return bytes.toFixed(dp) + ' ' + units[u];
}
function getRandom(ext) {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}
/**
 * 
 * @param {string} api 
 * @param {string} params 
 * @param {Object} options 
 * @returns 
 */


const formatPhone = function (number) {
	let formatted = number.replace(/\D/g, '');
	if (formatted.startsWith('0')) {
		formatted = formatted.substr(1) + S_WHATSAPP_NET;
	} else if (formatted.startsWith('62')) {
		formatted = formatted.substr(2) + S_WHATSAPP_NET;
	}
	return number.endsWith(S_WHATSAPP_NET) ? number : formatted;
}
const formatp = sizeFormatter({
	std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
	decimalPlaces: 2,
	keepTrailingZeroes: false,
	render: (literal, symbol) => `${literal} ${symbol}B`,
})
function webpToMp4(path) {
	return new Promise((resolve, reject) => {
		const form = new FormData()
		form.append('new-image-url', '')
		form.append('new-image', fs.createReadStream(path))
		axios({
			method: 'post',
			url: 'https://s6.ezgif.com/webp-to-mp4',
			data: form,
			headers: {
				'Content-Type': `multipart/form-data; boundary=${form._boundary}`
			}
		}).then(({ data }) => {
			const bodyFormThen = new FormData()
			const $ = cheerio.load(data)
			const file = $('input[name="file"]').attr('value')
			const token = $('input[name="token"]').attr('value')
			const convert = $('input[name="file"]').attr('value')
			const gotdata = {
				file: file,
				token: token,
				convert: convert
			}
			bodyFormThen.append('file', gotdata.file)
			bodyFormThen.append('token', gotdata.token)
			bodyFormThen.append('convert', gotdata.convert)
			axios({
				method: 'post',
				url: 'https://ezgif.com/webp-to-mp4/' + gotdata.file,
				data: bodyFormThen,
				headers: {
					'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
				}
			}).then(({ data }) => {
				const $ = cheerio.load(data)
				const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
				resolve({
					status: true,
					message: "Created By MRHRTZ",
					result: result
				})
			}).catch(reject)
		}).catch(reject)
	})
}
function TelegraPh(Path) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new FormData();
			form.append("file", fs.createReadStream(Path))
			const data = await axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}
async function UploadFileUgu(input) {
	return new Promise(async (resolve, reject) => {
		const form = new FormData();
		form.append("files[]", fs.createReadStream(input))
		await axios({
			url: "https://uguu.se/upload.php",
			method: "POST",
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
				...form.getHeaders()
			},
			data: form
		}).then((data) => {
			resolve(data.data.files[0])
		}).catch((err) => reject(err))
	})
}
function shrt(url, ...args) {
	let id = randomBytes(32).toString('base64').replace(/\W\D/gi, '').slice(0, 5);

	let data = {
		id,
		url,
	}
	Object.assign(data, ...args)
	if (db.some(x => x.url == url)) return data
	db.push(data);
	return data
}

// source -> https://stackoverflow.com/a/52560608
function secondsConvert(seconds, hour = false) {
	const format = val => `0${Math.floor(val)}`.slice(-2)
	const hours = seconds / 3600
	const minutes = (seconds % 3600) / 60
	const res = hour ? [hours, minutes, seconds % 60] : [minutes, seconds % 60]

	return res.map(format).join(':')
}

async function scrapeMangaTitles(query) {
	// Replace spaces and apostrophes with underscores
	const formattedQuery = query.replace(/[\s'"]/g, '_');
	const url = `https://w.mangairo.com/list/search/${formattedQuery}`;

	try {
		const { data } = await axios.get(url);
		const $ = cheerio.load(data);
		const titles = [];

		$('h2.story-name a[rel="nofollow"]').each((index, element) => {
			const title = $(element).text();
			const href = $(element).attr('href');
			titles.push({ title: title, url: href });
		});

		console.log(titles);
		return titles;
	} catch (error) {
		console.error('Error scraping manga titles:', error);
	}
}

async function fetchImageWithHeaders(imageUrl) {
	try {
		const response = await axios.get(imageUrl, {
			responseType: 'arraybuffer',
			headers: {
				'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
				'Accept-Encoding': 'gzip, deflate, br',
				'Accept-Language': 'en-US,en;q=0.6',
				'Cache-Control': 'no-cache',
				'Pragma': 'no-cache',
				'Referer': 'https://chap.mangairo.com/',
				'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Brave";v="122"',
				'Sec-Ch-Ua-Mobile': '?0',
				'Sec-Ch-Ua-Platform': '"Windows"',
				'Sec-Fetch-Dest': 'image',
				'Sec-Fetch-Mode': 'no-cors',
				'Sec-Fetch-Site': 'cross-site',
				'Sec-Gpc': '1',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
			},
		});
		return response.data;
	} catch (error) {
		console.error(`Failed to fetch image: ${imageUrl}, Status: ${error.response ? error.response.status : error}`);
		return null;
	}
}

async function fetchChapterImages(link, chapterNumber) {
	try {
		let response = await axios.get(link);
		let $ = cheerio.load(response.data);
		let chapterUrl;

		$('#chapter_list li a').each((i, elem) => {
			const chapterText = $(elem).text();
			if (chapterText.includes(`Chapter ${chapterNumber}:`)) {
				chapterUrl = $(elem).attr('href');

			} else if (chapterText.includes(`Chapter ${chapterNumber} :`)) {
				chapterUrl = $(elem).attr('href');

			} else if (chapterText.includes(`Chapter ${chapterNumber}`)) {
				chapterUrl = $(elem).attr('href');

			} else if (chapterText.includes(`Chapter ${chapterNumber} `)) {
				chapterUrl = $(elem).attr('href');

			}
		});

		if (!chapterUrl) {
			console.log('Chapter not found.');
			return;
		}

		response = await axios.get(chapterUrl);
		$ = cheerio.load(response.data);
		const imageUrls = [];
		$('.panel-read-story img').each((i, elem) => {
			const src = $(elem).attr('src');
			const title = $(elem).attr('title');
			if (src && title) {
				imageUrls.push(src);
			}
		});
		console.log(imageUrls)
		const pdfDoc = await PDFDocument.create();
		let processedImages = 0;
		for (const imageUrl of imageUrls) {
			const imageBytes = await fetchImageWithHeaders(imageUrl);
			if (imageBytes) {
				const image = await pdfDoc.embedJpg(imageBytes);
				const page = pdfDoc.addPage([image.width, image.height]);
				page.drawImage(image, {
					x: 0,
					y: 0,
					width: image.width,
					height: image.height,
				});
				processedImages++;
				console.log(`Progress: ${(processedImages / imageUrls.length * 100).toFixed(2)}%`);
			}
		}

		const pdfBytes = await pdfDoc.save();
		const buffer = Buffer.from(pdfBytes);
		// fs.writeFileSync('chapter.pdf', pdfBytes);
		console.log('PDF created successfully.');
		// console.log(buffer)
		return buffer;
	} catch (error) {
		console.error('Error fetching chapter images:', error);
	}
}
async function getMangaByName(name, chapter){
    scrapeMangaTitles(name).then(async (results) => {
        let url = results[0].url;
        let mangaBuffer = await fetchChapterImages(url, chapter);
		console.log(mangaBuffer)
		return mangaBuffer
		console.log("done");
		
    })

}

module.exports = {
	processTime,
	isUrl,
	bgColor,
	color,
	msgs,
	fileBuffer,
	humanFileSize,
	formatPhone,
	shrt,
	secondsConvert,
	getBuffer,
	makeExif,
	getRandom,
	webpToMp4,
	fetchJson,
	runtime,
	formatp,
	pinterest,
	TelegraPh,
	UploadFileUgu,
	scrapeMangaTitles,
	fetchChapterImages,
	getMangaByName,
	textToImage
};
