"use strict";
/**
 * 提供图片的直链服务(Swift object download proxy)
 *
 * @Request.uri - https://i.domain.com/<fileHashKey>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const responseTimer = require("response-time");
const cors = require("cors");
const env = require("../env");
const handler_1 = require("./handler");
const app = express();
app.disable("x-powered-by");
if (env.isDev) {
    app.use(responseTimer());
}
// Cors
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || env.DOWNLOAD_ALLOW_ORIGIN.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(`Origin ${origin} not allowed`);
        }
    }
};
// Route
app.get(/^\/([^\/]+)$/, cors(corsOptions), handler_1.default);
app.all("*", function (_, res) {
    res.sendStatus(404);
    res.end();
});
// Startup
app.listen(env.DOWNLOAD_PORT, env.DOWNLOAD_HOST, err => {
    if (err) {
        return console.error(err);
    }
    console.log(`Listening at http://${env.DOWNLOAD_HOST}:${env.DOWNLOAD_PORT}`);
});
