/**
 * 提供图片的直链服务(Swift object download proxy)
 * 
 * @Request.uri - https://i.domain.com/<fileHashKey>
 */

import * as express from "express";
import * as responseTimer from "response-time";
import * as cors from "cors";
import * as env from "../env";
import fileHandler from "./handler";

const app = express();
app.disable("x-powered-by");

if (env.isDev) {
    app.use(responseTimer());
}

// Cors
const corsOptions = {
    origin: function(origin, callback) {
        if (!origin || env.DOWNLOAD_ALLOW_ORIGIN.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(`Origin ${origin} not allowed`);
        }
    }
};

// Route
app.get(/^\/([^\/]+)$/, cors(corsOptions), fileHandler);

app.all("*", function(_, res) {
    res.sendStatus(404);
    res.end();
});

// Startup
app.listen(env.DOWNLOAD_PORT, env.DOWNLOAD_HOST, err => {
    if (err) {
        return console.error(err);
    }
    console.log(
        `Listening at http://${env.DOWNLOAD_HOST}:${env.DOWNLOAD_PORT}`
    );
});
