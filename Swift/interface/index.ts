/**
 * Connection class 构造方法参数接口
 */
export interface IConnectionOptions {
    url: string; // url to connect to
    ua?: string; // default User-Agent, if empty, use `Node-SwiftClient-v3` instead
    timeout?: number; // request timeout
    stream?: boolean; // for image response please enable stream responseType
}

/**
 * SwiftClient class 构造方法参数接口
 */
export interface ISwiftClientOptions {
    authUrl: string; // Keystone auth service base url
    ua?: string;
    timeout?: number;
    username?: string; // name of one keystone user
    password?: string; // password of one keystone user
    token?: string; // keystone token
    tokenDuration?: number; // how long to cache keystone token
    projDomain: string; // keystone project domain name
    userDomain: string; // keystone user domain name
}

/**
 * Endpotins
 */
export interface IEndPoint {
    region_id: string;
    url: string;
    region: string;
    interface: string;
    id: string;
}
