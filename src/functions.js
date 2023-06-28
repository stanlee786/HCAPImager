const process = require("node:process");
const puppeteer = require("puppeteer");
const { WebSocket } = require("ws");
const fs = require("node:fs");

// Functions class
module.exports = class Functions {

    // Send message functions
    createMessage(message) {

        // Make connection with Discord gateway
        const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

        // When the WebSocket connection opens
        ws.on("open", function () {

            // Send the identification request
            ws.send(JSON.stringify({
                op: 2,
                d: {
                    token: process.env.D_TOKEN,
                    intents: 3585,
                    properties: {
                        os: "linux",
                        browser: "chrome",
                        device: "chrome"
                    }
                }
            }))
        })

        // When the WebSocket receives a message
        ws.on("message", function (_data) {

            // Request data
            const data = JSON.parse(_data);

            // If OP 10
            if (data.op == 10) {

                // Post to channel
                fetch(`https://discord.com/api/v10/channels/${process.env.D_CHANNEL}/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bot ${process.env.D_TOKEN}`,
                    },

                    body: JSON.stringify({
                        content: message,
                        nonce: Math.floor(Math.random() * 10000000000000000000),
                        tts: false
                    })
                }).then(res => {

                    // Check status code
                    if (res.status !== 200) {
                        fs.appendFileSync("log.txt", `Succesfully saved images of 100 runs - ${new Date()}\n`, "utf-8");
                    }
                })
            }
        })
    }

    // Get NData function
    getNData(hsw, req) {

        this.log("Getting NData using puppeteer...");

        // New promise
        return new Promise((resolve) => {

            // Fetch hsw.js file
            fetch(hsw).then((res) => {
                res.text().then(async (hsw) => {
                    
                    // Create new headless browser
                    const browser = await puppeteer.launch({
                        ignoreHTTPSErrors: true,
                        headless: "new",
                        args: [
                            `--window-size=1300,570`,
                            "--window-position=000,000",
                            "--disable-dev-shm-usage",
                            "--no-sandbox",
                            "--disable-web-security",
                            "--disable-features=site-per-process",
                        ]
                    })
        
                    // Get pages
                    const [page] = await browser.pages();

                    // Add HSW script
                    await page.addScriptTag({
                        content: hsw
                    })
        
                    // Run HSW function
                    const response = await page.evaluate(`hsw("${req}")`);

                    // Close browser
                    await browser.close();

                    this.log("Succesfully got NData");
        
                    // Return n data
                    resolve(response);
                })
            })
        })
    }

    // Generate motion data
    getMotionData(start, end) {

        // Motion data array
        let data = [];

        // x & y
        let x = start;
        let y = end;

        // For loop
        for (let i = 0; i < 12; i++) {

            // Timestamp
            const timestamp = Date.now() + this.rdn(30, 120);
            data.push([Math.floor((Math.random() + 1) * x), Math.floor((Math.random() + 1) * y), timestamp]);
            x += 2;
            y -= 7;
        } 

        return data;
    }

    // Get random User Agent function
    getUserAgent() {

        // List of User-Agents
        const agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/108.0.5359.112 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36",
            "Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13.1; rv:108.0) Gecko/20100101 Firefox/108.0",
            "Mozilla/5.0 (X11; Linux i686; rv:108.0) Gecko/20100101 Firefox/108.0",
            "Mozilla/5.0 (iPad; CPU OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/108.0 Mobile/15E148 Safari/605.1.15",
            "Mozilla/5.0 (Android 13; Mobile; rv:68.0) Gecko/68.0 Firefox/108.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1",
            "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)",
            "Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
            "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)",
            "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54",
            "Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36 EdgA/108.0.1462.48",
            "Mozilla/5.0 (Linux; Android 10; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36 EdgA/108.0.1462.48",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 EdgiOS/108.1462.62 Mobile/15E148 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 OPR/96.0.4640.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 OPR/96.0.4640.0",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 OPR/96.0.4640.0",
            "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36 OPR/63.3.3216.58675",
            "Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36 OPR/63.3.3216.58675",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Vivaldi/5.6.2867.50",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Vivaldi/5.6.2867.50",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Vivaldi/5.6.2867.50",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Vivaldi/5.6.2867.50",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 YaBrowser/22.11.3 Yowser/2.5 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 YaBrowser/22.11.3 Yowser/2.5 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 YaBrowser/22.11.3 Yowser/2.5 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 YaBrowser/22.11.8.36 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; arm_64; Android 13; SM-G965F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 YaBrowser/21.3.4.59 Mobile Safari/537.36"
        ];

        return agents[Math.floor(Math.random() * agents.length)]
    }

    // Generate numbers using start & end integers
    rdn(start, end) {
        return Math.round(Math.random() * (end - start) + start);
    }

    // Log error function
    logError(err) {

        // Write error to file
        fs.appendFileSync("error.txt", `${err} - ${new Date()}\n`)
    }

    // Log functie
    log(msg) {

        // Get date
        const date = new Date();

        // Hours, minutes and seconds check
        const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();

        // Save time in variable
        const time = `${hours}:${minutes}:${seconds}`;

        // Voeg toe aan element
        console.log(`[${time}]: ${msg}`);
    }
}