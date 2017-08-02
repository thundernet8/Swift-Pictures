import * as path from "path";

// Init process.env
require("dotenv").config({ path: path.resolve(__dirname, "../envrc") });

export const isDev = process.env.NODE_ENV !== "production";
export const isProd = process.env.NODE_ENV === "production";

export const DOWNLOAD_HOST = isProd ? "127.0.0.1" : "0.0.0.0";
export const DOWNLOAD_PORT = isProd ? 8000 : 3005;

export const UPLOAD_HOST = isProd ? "127.0.0.1" : "0.0.0.0";
export const UPLOAD_PORT = isProd ? 8001 : 3001;

export const DELETE_HOST = isProd ? "127.0.0.1" : "0.0.0.0";
export const DELETE_PORT = isProd ? 8002 : 3002;

export const DOWNLOAD_ALLOW_ORIGIN = ["https://fuli.news", "http://fuli.news"];
export const UPLOAD_ALLOW_ORIGIN = [
    "https://fuli.news",
    "http://fuli.news",
    "http://127.0.0.1:8088"
];
export const DELETE_ALLOW_ORIGIN = [
    "https://fuli.news",
    "http://fuli.news",
    "http://127.0.0.1:8088"
];

// Public host
export const PUBLIC_DOWNLOAD_HOST = "https://i.fuli.news";
export const PUBLIC_UPLOAD_HOST = "https://s.fuli.news";
export const PUBLIC_DELETE_HOST = "https://s.fuli.news";

// OS options
export const OS_PROJECT_DOMAIN_NAME =
    process.env.OS_PROJECT_DOMAIN_NAME || "default";
export const OS_USER_DOMAIN_NAME = process.env.OS_USER_DOMAIN_NAME || "default";
export const OS_PROJECT_NAME = process.env.OS_PROJECT_NAME || "test";
export const OS_USERNAME = process.env.OS_USERNAME;
export const OS_PASSWORD = process.env.OS_PASSWORD;
export const OS_AUTH_URL =
    process.env.OS_AUTH_URL || "http://controller:5000/v3";
export const OS_IDENTITY_API_VERSION = process.env.OS_IDENTITY_API_VERSION || 3;
export const OS_IMAGE_API_VERSION = process.env.OS_IMAGE_API_VERSION || 2;

// File options
export const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // bytes
export const IMAGE_UPLOAD_COUNT_LIMIT = 5;
export const IMAGE_ALLOW_MIMES = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/bmp",
    "image/bitmap",
    "image/tiff"
];
