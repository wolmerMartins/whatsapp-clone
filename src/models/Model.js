import Events from '../utils/ClassEvent';

class Model extends Events {
    constructor() {
        super();
        this._data = {};
    }

    fromJSON(json) {
        this._data = Object.assign(this._data, json);
        this.trigger('datachange', this.toJSON())
    }

    toJSON() {
        return this._data;
    }
}

export default Model;
