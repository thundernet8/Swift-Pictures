/**
 * 提供图片的直链服务(Swift object download proxy)
 * 
 * @Request.uri - https://i.domain.com/<fileHashKey>
 */

import * as express from "express";
import * as responseTimer from "response-time";
import * as cors from "cors";
import * as env from "../env";

const app = express();
app.disable("x-powered-by");

if (env.isDev) {
    app.use(responseTimer());
}

// Cors
const corsOptions = {
    origin: function(origin, callback) {
        if (env.DOWNLOAD_ALLOW_ORIGIN.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed`));
        }
    }
};

// Route
app.get(/^\/([^\/]+)$/, cors(corsOptions), function(req, res, next) {
    const fileKey = req.url.slice(1);
    res.send(fileKey);
});

app.all("*", function(req, res) {
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
