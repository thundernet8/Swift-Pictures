import * as env from "./env";
import SwiftClient from "../Swift/client";

const client = new SwiftClient({
    authUrl: env.OS_AUTH_URL,
    projDomain: env.OS_PROJECT_DOMAIN_NAME,
    userDomain: env.OS_USER_DOMAIN_NAME,
    username: env.OS_USERNAME,
    password: env.OS_PASSWORD
});

export default client;
