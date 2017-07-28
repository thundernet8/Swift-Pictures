"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Swift {
    constructor(options) {
        this._getDefaultOptions = () => {
            return {}; // TODO
        };
        this._createConnection = () => {
            // TODO
        };
        this.options = Object.assign(this._getDefaultOptions(), options || {});
    }
}
exports.default = Swift;
