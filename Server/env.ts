// Init process.env
require("dotenv").config({ path: "../envrc" });

export const isDev = process.env.NODE_ENV !== "production";
export const isProd = process.env.NODE_ENV === "production";

export const DOWNLOAD_HOST = isProd ? "i.fuli.news" : "0.0.0.0";
export const DOWNLOAD_PORT = isProd ? 8000 : 3005;

export const UPLOAD_HOST = isProd ? "s.fuli.news" : "0.0.0.0";
export const UPLOAD_PORT = isProd ? 8001 : 3001;

export const DELETE_HOST = isProd ? "s.fuli.news" : "0.0.0.0";
export const DELETE_PORT = isProd ? 8002 : 3002;

export const DOWNLOAD_ALLOW_ORIGIN = ["https://fuli.news"];

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
