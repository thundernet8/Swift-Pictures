"use strict";
// ExtensibleError
Object.defineProperty(exports, "__esModule", { value: true });
function ExtendableErrorBuiltin() {
    function ExtendableBuiltin() {
        Error.apply(this, arguments);
        // Set this.message
        Object.defineProperty(this, "message", {
            configurable: true,
            enumerable: false,
            value: arguments.length ? String(arguments[0]) : ""
        });
        // Set this.name
        Object.defineProperty(this, "name", {
            configurable: true,
            enumerable: false,
            value: this.constructor.name
        });
        if (typeof Error.captureStackTrace === "function") {
            // Set this.stack
            Error.captureStackTrace(this, this.constructor);
        }
        return this;
    }
    ExtendableBuiltin.prototype = Object.create(Error.prototype);
    Object.setPrototypeOf(ExtendableBuiltin, Error);
    return ExtendableBuiltin;
}
const ExtensibleError = ExtendableErrorBuiltin();
// Swift Error
class SwiftClientError extends ExtensibleError {
    constructor(msg) {
        super(msg);
    }
}
exports.SwiftClientError = SwiftClientError;
// Timeout Error
class TimeoutError extends ExtensibleError {
}
exports.TimeoutError = TimeoutError;
