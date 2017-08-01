import client from "../swift";
import * as Busboy from "busboy";
import * as MD5 from "md5";
import * as SizeOf from "image-size";
import { randCase } from "../util";
import {
    DOWNLOAD_HOST,
    IMAGE_SIZE_LIMIT,
    IMAGE_ALLOW_MIMES,
    isDev
} from "../env";

// TODO 上传频度限制

export default async function(req, res) {
    if (isDev) {
        console.log(req.url);
    }
    const busboy = new Busboy({ headers: req.headers });

    let headers = {};
    busboy.on("field", function(
        fieldname,
        val,
        _fieldnameTruncated,
        _valTruncated
    ) {
        //console.log("Field [" + fieldname + "]: value: " + val);
        //console.log(`xxxx-${fieldnameTruncated}-${valTruncated}`);
        headers[`X-Field-${fieldname}`] = val;
    });

    busboy.on("file", function(
        _fieldname,
        file,
        filename,
        _encoding,
        mimetype
    ) {
        // if (encoding === "7bit") {
        //     encoding = "binary";
        // }
        let chunks: any[] = [];
        file.on("data", function(data) {
            chunks.push(data);
        });
        file.on("end", async function() {
            const resp = {
                code: 0,
                result: {},
                msg: ""
            };
            const buffer = Buffer.concat(chunks);
            const size = buffer.length;
            if (size > IMAGE_SIZE_LIMIT) {
                resp.msg = "File size exceed limit";
                res.status(400).send(resp);
            }
            if (size < 1) {
                resp.msg = "File is empty";
                res.status(400).send(resp);
            }
            if (IMAGE_ALLOW_MIMES.indexOf(mimetype.toLowerCase()) < 0) {
                resp.msg = "File has an unsupported mime type";
                res.status(400).send(resp);
            }
            const md5 = MD5(buffer);
            const demensions = SizeOf(buffer);
            let containerName =
                md5.slice(1, 2) +
                md5.slice(5, 6) +
                md5.slice(10, 11) +
                md5.slice(20, 21) +
                md5.slice(25, 26);
            // containerName should not start with number, first number char has unique use
            if (/^[0-9].*/.test(containerName)) {
                let i = md5.length - 1;
                while (i >= 0) {
                    const letter = md5.slice(i, i + 1);
                    if (/[a-z]/i.test(letter)) {
                        containerName = (letter + containerName).toLowerCase();
                        break;
                    }
                    i--;
                }
            }
            const objectName = md5;
            headers = Object.assign(
                {
                    ["Content-Type"]: mimetype,
                    ["X-Object-Meta-Name"]: encodeURIComponent(filename),
                    ["X-Object-Meta-MD5"]: md5,
                    ["X-Object-Meta-Width"]: demensions.width,
                    ["X-Object-Meta-Height"]: demensions.height,
                    ["X-Object-Meta-Size"]: size,
                    ["X-Object-Meta-IP"]:
                        req.headers["x-forwarded-for"] ||
                        req.connection.remoteAddress
                },
                headers
            );
            try {
                await client.putContainer(containerName, {
                    ["X-Container-Read"]: ".r:*"
                });
            } catch (e) {
                resp.msg = "Could not upload file";
                if (isDev) {
                    console.log("put container error");
                }
                res.status(500).send(resp);
            }
            return client
                .putObject(containerName, objectName, headers, buffer)
                .then(result => {
                    if (result.status < 200 || result.status >= 300) {
                        if (isDev) {
                            console.log(
                                `put object with ${result.status} status error`
                            );
                            console.log(result);
                        }
                        resp.msg = result.data.toString();
                        res.status(result.status).send(resp);
                    }
                    const path = `${md5.slice(
                        15,
                        16
                    )}${containerName.length}${randCase(
                        containerName
                    )}${randCase(objectName)}`;
                    resp.code = 1;
                    resp.result = {
                        filename,
                        size,
                        width: demensions.width,
                        height: demensions.height,
                        url: `${DOWNLOAD_HOST}/${path}`,
                        path,
                        delete: "" // TODO
                    };
                    res.status(200).send(resp);
                })
                .catch(err => {
                    resp.msg =
                        err instanceof Error
                            ? err.message
                            : err.response.data.message;
                    if (isDev) {
                        console.log(`put object with error: ${resp.msg}`);
                        console.log(err);
                    }
                    res.status(err.status || 400).send(resp);
                });
        });
    });

    // busboy.on("finish", function() {
    //     res.writeHead(200, { Connection: "close" });
    //     res.end("done");
    // });
    return req.pipe(busboy);
}
