import { KEYSTONE_BASE_URL } from "../env";
import HTTPConnection from "../../Swift/connection";
export default async function(_req, res) {
    // const fileKey = req.url.slice(1);
    const conn = new HTTPConnection({
        url: KEYSTONE_BASE_URL
    });
    try {
        const resp = (await conn.request("POST", "/v3/auth/tokens")) as any;
        console.log(resp);
        res.set("Content-Type", "application/json");
        res.send(resp.headers);
    } catch (e) {
        // console.log(e);
        res.send(e.toString());
    }
}
