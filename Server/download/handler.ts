// import { OS_AUTH_URL } from "../env";
import client from "../swift";

client.on("error", e => {
    console.log(e);
});

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
    // client.on("error", err => {
    //     res.send(err);
    // });
    // const resp = await client.getAuth();
    // res.send(resp.data);
    const resp = await client.getContainer("container1", 10);
    res.send(resp.data);
}
