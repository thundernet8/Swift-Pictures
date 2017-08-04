/**
 * Swift request client, include keystone auth request
 */

import { ISwiftClientOptions, IEndPoint } from "./interface";
import HTTPConnection from "./connection";
import { SwiftClientError } from "./error";
import * as EventEmitter from "events";

// API docs
// https://developer.openstack.org/api-ref/object-store/

const TOKEN_EXPIRY_DURATION = 3600; // keystone auth token expiration duration

export default class SwiftClient extends EventEmitter {
    options: ISwiftClientOptions;
    authStore: AuthStore;
    endpoints: IEndPoint[];
    constructor(options: ISwiftClientOptions) {
        super();
        const {
            authUrl,
            swiftBaseUrl,
            username,
            password,
            token,
            projDomain,
            userDomain
        } = options;
        if (!authUrl || !swiftBaseUrl || !projDomain || !userDomain) {
            const err = new SwiftClientError(
                "Missing paramters authUrl or swiftBaseUrl or domains in options"
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
            tokenDuration: TOKEN_EXPIRY_DURATION,
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
     * swift discoverability
     */

    // query {
    //     swiftinfo_sig: string;
    //     swiftinfo_expires: number;
    // }
    discover = async (query?: any) => {
        await this._ensureFreshToken();
        const headers = {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const resp = await this._createConnection(
            this.options.swiftBaseUrl,
            false
        )
            .request("GET", "/info", query, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    /**
     * swift account
     */

    // show account details and list containers
    // query {
    //     limit?: number;
    //     marker?: string;
    //     end_marker?: string;
    //     prefix?: string;
    //     delimiter?: string;
    // }
    getAccounts = async (name: string, query: any, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const url = name
            ? this.options.swiftBaseUrl + "/" + name
            : this.internalStorageEndpoint.url;

        const resp = await this._createConnection(url, false)
            .request("GET", "", query, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // create update or delete account metadata
    // X-Account-Meta-name to create or update meta with name
    // X-Remove-Account-name to delete meta with name
    postAccount = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const url = name
            ? this.options.swiftBaseUrl + "/" + name
            : this.internalStorageEndpoint.url;

        const resp = await this._createConnection(url)
            .request("POST", "", {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // show account metadata
    headAccount = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const url = name
            ? this.options.swiftBaseUrl + "/" + name
            : this.internalStorageEndpoint.url;

        const resp = await this._createConnection(url)
            .request("HEAD", "", {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    /**
     * swift container
     */

    // create update or delete container metadata
    postContainer = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";
        // metadata should saved in headers with `X-Container-Meta-your meta name' key
        const resp = await this._createConnection(
            this.internalStorageEndpoint.url
        )
            .request("POST", `/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // show container metadata
    headContainer = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";
        const resp = await this._createConnection(
            this.internalStorageEndpoint.url
        )
            .request("PUT", `/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // delete container
    deleteContainer = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";
        const resp = await this._createConnection(
            this.internalStorageEndpoint.url
        )
            .request("DELETE", `/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // create container
    putContainer = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url
        )
            .request("PUT", `/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // get container details and list objects
    getContainer = async (name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";
        headers["Accept"] = "application/json";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url
        )
            .request("PUT", `/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    /**
     * swift object
     */

    // get a object content and metadata
    getObject = async (container: string, name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url,
            true // use stream
        )
            .request("GET", `/${container}/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // create or replace a object
    putObject = async (
        container: string,
        name: string,
        headers: any = {},
        filedata: any = null
    ) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url,
            false
        )
            .request("PUT", `/${container}/${name}`, {}, headers, filedata)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // delete object
    deleteObject = async (
        container: string,
        name: string,
        headers: any = {}
    ) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url,
            false
        )
            .request("DELETE", `/${container}/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // show object metadata
    headObject = async (container: string, name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url,
            false
        )
            .request("HEAD", `/${container}/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    // create or update obejct metadata
    postObject = async (container: string, name: string, headers: any = {}) => {
        await this._ensureFreshToken();
        headers = headers || {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";

        const resp = await this._createConnection(
            this.internalStorageEndpoint.url,
            false
        )
            .request("POST", `/${container}/${name}`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };

    /**
     * swift endpoints
     */

    // get exposed endpoints
    // swiftBaseUrl: e.g. http://controller:8080/v1
    getEndpoints = async (swiftBaseUrl?: string) => {
        await this._ensureFreshToken();
        const headers = {};
        headers["X-Auth-Token"] = this.authStore.token;
        headers["Accept-Encoding"] = "gzip";

        swiftBaseUrl = swiftBaseUrl || this.options.swiftBaseUrl;
        const resp = await this._createConnection(swiftBaseUrl, false)
            .request("GET", `/endpoints`, {}, headers)
            .catch(result => {
                this.emit("error", result.response.data);
                return result;
            });
        return resp;
    };
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
            this.issueTime + this.cacheDuration <= currentTime ||
            this.expireTime <= currentTime
        ) {
            return true;
        }
        return false;
    }
}
