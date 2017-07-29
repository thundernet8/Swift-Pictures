/**
 * Swift request client, include keystone auth request
 */

import { ISwiftClientOptions, IEndPoint } from "./interface";
import HTTPConnection from "./connection";
import { SwiftClientError } from "./error";
import * as EventEmitter from "events";

const TOKEN_EXPIRY_DURATION = 3600; // keystone auth token expiration duration

export default class SwiftClient extends EventEmitter {
    options: ISwiftClientOptions;
    authStore: AuthStore;
    endpoints: IEndPoint[];
    constructor(options: ISwiftClientOptions) {
        super();
        const {
            authUrl,
            username,
            password,
            token,
            projDomain,
            userDomain
        } = options;
        if (!authUrl || !projDomain || !userDomain) {
            const err = new SwiftClientError(
                "Missing paramters authUrl or domains in options"
            );
            this.emit("error", err);
            return;
        }
        if (!((username && password) || token)) {
            const err = new SwiftClientError(
                "Missing credentials, you should provide username and password pair or token"
            );
            this.emit("error", err);
            return;
        }
        this.options = Object.assign(
            this._getDefaultOptions(),
            options || ({} as any)
        );
    }

    _getDefaultOptions = () => {
        return {
            tokenExpiration: TOKEN_EXPIRY_DURATION,
            timeout: 10000
        };
    };

    _createConnection = (url: string, stream: boolean = false) => {
        return new HTTPConnection({
            url,
            stream,
            timeout: this.options.timeout
        });
    };

    /**
     * keystone services
     */
    getAuth = async () => {
        const {
            username,
            password,
            token,
            projName,
            projDomain,
            userDomain
        } = this.options;
        const scope = {
            project: {
                name: projName,
                domain: {
                    name: projDomain
                }
            }
        };
        let data;
        if (token) {
            data = {
                auth: {
                    identity: {
                        methods: ["token"],
                        token: {
                            id: token
                        }
                    },
                    scope
                }
            };
        } else {
            data = {
                auth: {
                    identity: {
                        methods: ["password"],
                        password: {
                            user: {
                                name: username,
                                domain: {
                                    name: userDomain
                                },
                                password: password
                            }
                        }
                    },
                    scope
                }
            };
        }

        const resp = await this._createConnection(this.options.authUrl)
            .request("POST", "/auth/tokens", data)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });

        const { headers } = resp;
        if (!headers || !resp.data) {
            // 401 response
            return new SwiftClientError("Authorization failed");
        }

        const tokenObj = resp.data.token;
        // Store token
        this.authStore = new AuthStore(
            headers["x-subject-token"],
            tokenObj.user.id,
            tokenObj.user.name,
            tokenObj.issued_at,
            tokenObj.expires_at,
            this.options.tokenDuration as number
        );
        // Set endpoints
        if (tokenObj.catalog && tokenObj.catalog.length) {
            this.endpoints = tokenObj.catalog.find(
                x => x.name === "swift"
            ).endpoints;
        }
        return resp;
    };

    _ensureFreshToken = async () => {
        if (!this.authStore || this.authStore.isExpired) {
            await this.getAuth();
        }
    };

    /**
     * swift services
     */
    _getStorageEndpoint = (_interface: string = "internal") => {
        return this.endpoints.find(
            x => x.interface === _interface
        ) as IEndPoint;
    };

    get internalStorageEndpoint() {
        return this._getStorageEndpoint("internal");
    }

    get publicStorageEndpoint() {
        return this._getStorageEndpoint("public");
    }

    get adminStoragePoint() {
        return this._getStorageEndpoint("admin");
    }

    /**
     * swift account
     */

    /**
     * swift container
     */

    // get a listing of objects for the container
    getContainer = async (
        name: string,
        limit: number = 20,
        headers: any = {}
    ) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const resp = await this._createConnection(
            this.publicStorageEndpoint.url
        )
            .request("GET", `/${name}`, { limit }, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    /**
     * swift object
     */
}

// Utilities
class AuthStore {
    token: string;
    user: { id: string; name: string };
    domain: { id: string; name: string };
    issueTime: number;
    expireTime: number;
    cacheDuration: number;
    constructor(
        token: string,
        uid: string,
        username: string,
        issueAt: string,
        expireAt: string,
        cacheDuration: number
    ) {
        this.token = token;
        this.user = {
            id: uid,
            name: username
        };
        this.issueTime = Math.ceil(new Date(issueAt).getTime() / 1000);
        this.expireTime = Math.ceil(new Date(expireAt).getTime() / 1000);
        this.cacheDuration = cacheDuration;
    }

    get isExpired() {
        const currentTime = Math.ceil(new Date().getTime() / 1000);
        if (
            this.issueTime + this.cacheDuration >= currentTime ||
            this.expireTime >= currentTime
        ) {
            return true;
        }
        return false;
    }
}
