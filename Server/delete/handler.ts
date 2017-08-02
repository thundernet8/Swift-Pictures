import client from "../swift";
import { isDev } from "../env";

export default async function(req, res) {
    if (isDev) {
        console.log(req.url);
    }

    const resp = {
        code: 0,
        msg: ""
    };

    if (!req.body || !req.body.containerName || !req.body.objectName) {
        resp.msg = "missing containerName or objectName";
        res.status(400).send(resp);
    }

    console.log(req.body);

    const containerName = req.body.containerName;
    const objectName = req.body.objectName;

    return client
        .deleteObject(containerName, objectName)
        .then(result => {
            if (result.status < 200 || result.status >= 300) {
                if (isDev) {
                    console.log(
                        `delete object with ${result.status} status error`
                    );
                    console.log(result);
                }
                resp.msg = result.data.toString();
                res.status(result.status).send(resp);
            }

            resp.code = 1;
            resp.msg = `delete object ${objectName} on container ${containerName} success`;
            res.status(200).send(resp);
        })
        .catch(err => {
            resp.msg =
                err instanceof Error ? err.message : err.response.data.message;
            if (isDev) {
                console.log(`delete object with error: ${resp.msg}`);
                console.log(err);
            }
            res.status(err.status || 400).send(resp);
        });
}
