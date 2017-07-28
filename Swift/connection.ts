import { IConnectionOptions } from "./interface";
import * as URL from "url";
// import * as fs from "fs";
import * as EventEmitter from "events";
import { SwiftClientError } from "./error";
import axios from "axios";

/**
 * Connection class
 */
export default class HTTPConnection extends EventEmitter {
    url: string;
    host: string;
    port: number;
    protocol: string;
    parsedUrl: any;
    requestArgs: any = {};
    defaultUA: string;
    constructor(options: IConnectionOptions) {
        super();
        const { url, ua, timeout } = options;
        this.url = url;
        this.parsedUrl = URL.parse(url);
        this.host = this.parsedUrl.hostname;
        this.protocol = this.parsedUrl.protocol;
        if (["http:", "https:"].indexOf(this.protocol.toLowerCase()) == -1) {
            throw new SwiftClientError(
                `Unsupported protocol "${this.protocol}" in url "${url}"`
            );
        }
        this.port =
            this.parsedUrl.port || (this.protocol === "https:" ? 443 : 80);
        this.defaultUA = ua || "Node-SwiftClient-v3";
        this.requestArgs = {
            timeout,
            stream: true
        };

        // TODO CA verify
    }

    request = async (
        method: string,
        path: string,
        _data: any = null,
        headers: any = {},
        _files: any = null
    ) => {
        if (!headers["user-agent"]) {
            headers["user-agent"] = this.defaultUA;
        }
        const url = `${this.protocol}//${this.parsedUrl.host}${path}`;
        try {
            const resp = await axios({
                url,
                method: method.toUpperCase(),
                headers,
                data: {
                    auth: {
                        identity: {
                            methods: ["password"],
                            password: {
                                user: {
                                    name: "demo",
                                    domain: {
                                        name: "default"
                                    },
                                    password: "root"
                                }
                            }
                        }
                    }
                }
            });
            return resp;
        } catch (e) {
            this.emit("error", e);
        }
    };
}
