/**
 * Connection class 构造方法参数接口
 */
export interface IConnectionOptions {
    url: string; // url to connect to
    ua: string; // default User-Agent, if empty, use `Node-SwiftClient-v3` instead
    timeout?: number; // request timeout
}
