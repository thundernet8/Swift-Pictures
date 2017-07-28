import { IConnectionOptions } from "./interface";
import * as URL from "url";
import { SwiftClientError } from "./error";

/**
 * Connection class
 */
export default class Connection {
    url: string;
    host: string;
    port: number;
    protocol: string;
    parsedUrl: any;
    requestArgs: any = {};
    defaultUA: string;
    constructor(options: IConnectionOptions) {
        const { url, ua, timeout } = options;
        this.url = url;
        this.parsedUrl = URL.parse(url);
        this.host = this.parsedUrl.hostname;
        this.protocol = this.parsedUrl.protocol;
        if (["http", "https"].indexOf(this.protocol.toLowerCase()) !== -1) {
            throw new SwiftClientError(
                `Unsupported protocol "${this.protocol}" in url "${url}"`
            );
        }
        this.port =
            this.parsedUrl.port || (this.protocol === "https" ? 443 : 80);
        this.defaultUA = ua || "Node-SwiftClient-v3";
        this.requestArgs = {
            timeout,
            stream: true
        };

        // TODO CA verify
    }

    request = (
        method: string,
        path: string,
        data: any = null,
        headers: any = {},
        files: any = null
    ) => {};
}
