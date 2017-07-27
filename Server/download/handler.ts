export default function(req, res) {
    const fileKey = req.url.slice(1);
    res.send(fileKey);
}
