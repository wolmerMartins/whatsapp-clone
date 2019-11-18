import Model from './Model';
import Firebase from '../utils/Firebase';

class User extends Model {
    constructor(id) {
        super();

        if (id) this.getById(id);
    }

    getById(id) {
        return new Promise((s, f) => {
            User.findByEmail(id).onSnapshot(doc => this.fromJSON(doc.data()));
        });
    }

    save() {
        return User.findByEmail(this.email).set(this.toJSON());
    }

    static getRef() {
        return Firebase.db().collection('/users');
    }

    static findByEmail(email) {
        return User.getRef().doc(email);
    }

    get name() {
        return this._data.name;
    }

    set name(name) {
        this._data.name = name;
    }

    get email() {
        return this._data.email;
    }

    set email(email) {
        this._data.email = email;
    }

    get photo() {
        return this._data.photo;
    }

    set photo(photo) {
        this._data.photo = photo;
    }
}

export default User;