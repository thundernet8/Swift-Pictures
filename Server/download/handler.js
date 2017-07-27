"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(req, res) {
    const fileKey = req.url.slice(1);
    res.send(fileKey);
}
exports.default = default_1;
