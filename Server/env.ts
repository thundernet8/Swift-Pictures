export const isDev = process.env.NODE_ENV !== "production";
export const isProd = process.env.NODE_ENV === "production";

export const DOWNLOAD_HOST = isProd ? "i.fuli.news" : "0.0.0.0";
export const DOWNLOAD_PORT = isProd ? 8000 : 3000;

export const UPLOAD_HOST = isProd ? "s.fuli.news" : "0.0.0.0";
export const UPLOAD_PORT = isProd ? 8001 : 3001;

export const DELETE_HOST = isProd ? "s.fuli.news" : "0.0.0.0";
export const DELETE_PORT = isProd ? 8002 : 3002;

export const DOWNLOAD_ALLOW_ORIGIN = ["https://fuli.news"];
