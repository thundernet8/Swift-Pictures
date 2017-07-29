// import { OS_AUTH_URL } from "../env";
// import HTTPConnection from "../../Swift/connection";
import client from "../swift";

export default async function(_req, res) {
    // const fileKey = req.url.slice(1);
    // const conn = new HTTPConnection({
    //     url: OS_AUTH_URL
    // });
    // try {
    //     const resp = (await conn.request("POST", "/auth/tokens", data)) as any;
    //     console.log(resp.status);
    //     res.set("Content-Type", "application/json");
    //     res.status(resp.status).send(resp.data);
    // } catch (e) {
    //     res.send(e.toString());
    // }
    client.on("error", err => {
        res.send(err);
    });
    // 如果promise发生了catch, client中会将resp置为null
    const resp = await client.getAuth();
    resp && res.send(resp.data);
    // const resp = await client.getContainer("container1", 10);
    // resp && res.send(resp.data);
}
