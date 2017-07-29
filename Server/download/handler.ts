// import { OS_AUTH_URL } from "../env";
import client from "../swift";

export default async function(req, res) {
    const fileKey = req.url.slice(1); // filekey -> <container length><container name><object hashed name>
    const containerNameLength = parseInt(fileKey.slice(0, 1));
    const containerName = fileKey.slice(1, 1 + containerNameLength);
    const objectName = fileKey.slice(1 + containerNameLength);
    if (containerNameLength > 0 && containerNameLength < 10) {
        const resp = await client.getObject(containerName, objectName);
        console.log(resp.headers);
        if (resp.data && resp.data.pipe) {
            res.setHeader("Content-Type", resp.headers["content-type"]);
            res.setHeader("Content-Length", resp.headers["content-length"]);
            res.setHeader("Accept-Ranges", resp.headers["accept-ranges"]);
            res.setHeader("ETag", resp.headers["etag"]);
            res.setHeader("Last-Modified", resp.headers["last-modified"]);
            res.setHeader("Date", resp.headers["date"]);
            res.setHeader("Cache-Control", "max-age=2592000");
            resp.data.pipe(res);
            return;
        }
    }
    res.sendStatus(404);
    res.end();
}
