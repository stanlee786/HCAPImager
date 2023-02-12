const Functions = require("./functions");
const cluster = require("node:cluster");
const crypto = require("node:crypto");
const jsw = require("jsonwebtoken");
const request = require("request");
const functions = new Functions();
const fs = require("node:fs");
require("dotenv").config();

// Check if cluster is primary
if (cluster.isPrimary) {
    
    // Counters
    let count = 0;
    let mainCount = 0;
    let workerCount = 0;

    // Check if result folder exists
    if (!fs.existsSync("./result")) {

        // Create directory
        fs.mkdirSync("./result");
    }

    // Fork cluster
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }

    // On message
    cluster.on("message", function (worker, msg, handle) {

        // Check message
        if (msg.topic == "COUNT") {

            // Increase counter
            count += 1;

            // Loop
            Object.keys(cluster.workers).forEach((id) => {

                // Send message
                cluster.workers[id].send({
                    topic: "COUNT",
                    value: count
                })
            })
        } else if (msg.topic == "MAIN_COUNT") {

            // Check worker count
            if (workerCount == 0) {

                // Increase worker count
                workerCount += 1;

                // Increase counter
                mainCount += 1;

                // Reset counter
                count = 0;

                // Send message to channel
                functions.createMessage(`Succesfully saved images of 100 runs - x${mainCount}`);
            }
        }
    })

    // On exit
    cluster.on("exit", function (worker, code, signal) {
        console.log(`Worker "${worker.process.pid}" died with code "${code}"`);

        // Kill worker
        worker.destroy();

        // Fork cluster
        cluster.fork();
    })
} else {
    
    // Start process
    checkConfig();

    // Check site config function
    function checkConfig() {

        // Random User Agent
        const userAgent = functions.getUserAgent();

        // Check site configuration and get data
        fetch(`https://hcaptcha.com/checksiteconfig?v=${process.env.H_VERSION}&host=${process.env.H_HOST}&sitekey=${process.env.H_SITEKEY}&sc=1&swa=1`, {
            method: "POST",
            headers: {
                "User-Agent": userAgent
            }
        }).then((res) => {
            res.text().then(async (body) => {

                // Parse data
                const data = JSON.parse(body);

                // Decoded data
                const decoded = jsw.decode(data.c.req);

                // Check if decoded 'n' is HSW
                if (decoded.n == "hsw") {

                    // Get CAPTCHA challenge
                    getCaptcha(userAgent, data, decoded);

                } else {
                    functions.log(`Invalid type: ${decoded.n}`);
                    setTimeout(() => {
                        checkConfig();
                    }, functions.rdn(1000, 10000));
                }
            })
        })
    }

    // Get CAPTCHA function
    async function getCaptcha(userAgent, data, decoded) {

        // Timestamp
        let timestamp = Date.now() + functions.rdn(30, 120);

        // Get CAPTCHA challenge
        request("https://hcaptcha.com/getcaptcha", {
            method: "post",
            headers: {
                "User-Agent": userAgent
            },

            json: true,
            form: {
                v: process.env.H_VERSION,
                sitekey: process.env.H_SITEKEY,
                host: process.env.H_HOST,
                hl: "en",
                motionData: {
                    st: timestamp,
                    dct: timestamp,
                    mm: functions.getMotionData(1, 100)
                },
                n: await functions.getNData(`${decoded.l}/hsw.js`, data.c.req),
                c: JSON.stringify(data.c)
            }
        }, (err, resp) => {

            // Check for error
            if (err) functions.logError(err);

            // Log
            functions.log(`HCAPTCHA Challenge: ${resp.body.requester_question.en}`);

            // Get directory name
            const directory = resp.body.requester_question.en.replaceAll(" ", "_").split("Please_click_each_image_containing_a_")[1];

            // Check if directory exists
            if (!fs.existsSync(`./result/${directory}`)) {

                // Make directory
                fs.mkdirSync(`./result/${directory}`);
            }
            
            // For loop for all images
            for (let i = 0; i < resp.body.tasklist.length; i++) {

                // Get image
                fetch(`${resp.body.tasklist[i].datapoint_uri}`).then(async res => {
                    
                    // Blob
                    const blob = await res.blob();

                    // Array Buffer
                    const arrayBuffer = await blob.arrayBuffer();

                    // Buffer
                    const buffer = Buffer.from(arrayBuffer);

                    // Get file name by hashing buffer, should get rid of duplicates
                    const fileName = crypto.createHash("md5").update(buffer).digest("hex");

                    // Save image
                    fs.writeFile(`./result/${directory}/${fileName}.jpg`, buffer, (err) => {

                        // Check for error
                        if (err) functions.logError(err);
                    });
                })
            }

            // Log
            functions.log("Succesfully saved images");

            // Counter 1 up
            process.send({
                topic: "COUNT"
            })

            // On message
            process.on("message", function (msg) {

                // Check message
                if (msg.topic == "COUNT") {

                    // Check count
                    if (msg.value == 100) {

                        // Main counter + 1
                        process.send({
                            topic: "MAIN_COUNT"
                        })
                    }
                }
            })

            // Loop
            setTimeout(() => {
                checkConfig();
            }, functions.rdn(1000, 10000));
        })
    }
}