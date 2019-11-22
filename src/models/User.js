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

    addContact(contact) {
        return User.getContactsRef(this.email)
            .doc(btoa(contact.email)).set(contact.toJSON());
    }

    getContacts() {
        return new Promise((s, f) => {
            User.getContactsRef(this.email).onSnapshot(docs => {
                let contacts = [];
                
                docs.forEach(doc => {
                    let data = doc.data();
                    data.id = doc.id;
                    
                    contacts.push(data);
                });

                this.trigger('contactschange', docs);
                s(contacts);
            });
        });
    }

    static getRef() {
        return Firebase.db().collection('/users');
    }

    static getContactsRef(id) {
        return User.getRef().doc(id).collection('contacts');
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

    get chatId() {
        return this._data.chatId;
    }

    set chatId(chatId) {
        this._data.chatId = chatId;
    }
}

export default User;