/**
 * 提供图片的删除代理服务(Swift object delete proxy)
 *
 * @Request.uri - https://s.domain.com/delete/
 */

import * as express from "express";
import * as responseTimer from "response-time";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as env from "../env";
import fileHandler, { deleteLinkHandler } from "./handler";

const app = express();
app.disable("x-powered-by");

if (env.isDev) {
    app.use(responseTimer());
}

// Cors
const corsOptions = {
    origin: function(origin, callback) {
        if (!origin || env.DELETE_ALLOW_ORIGIN.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(`Origin ${origin} not allowed`);
        }
    }
};

// Route
app.options("*", function(_req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendStatus(200);
    res.end();
});

app.get(/^\/delete\/([^\/]+)$/, deleteLinkHandler);

app.post("/delete", cors(corsOptions), bodyParser.json(), fileHandler);

app.all("*", function(_req, res) {
    res.sendStatus(404);
    res.end();
});

// Startup
app.listen(env.DELETE_PORT, env.DELETE_HOST, err => {
    if (err) {
        return console.error(err);
    }

    console.log(`Listening at http://${env.DELETE_HOST}:${env.DELETE_PORT}`);
});
