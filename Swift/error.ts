// ExtensibleError

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

const ExtensibleError = ExtendableErrorBuiltin() as FunctionConstructor;

// Swift Error
export class SwiftClientError extends ExtensibleError {
    constructor(msg?: string) {
        super(msg as string);
    }
}

// Timeout Error
export class TimeoutError extends ExtensibleError {}
