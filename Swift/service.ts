export default class Swift {
    options: any;
    constructor(options?) {
        this.options = Object.assign(this._getDefaultOptions(), options || {});
    }

    _getDefaultOptions = () => {
        return {}; // TODO
    };

    _createConnection = () => {
        // TODO
    };
}
