import Model from './Model';
import Firebase from '../utils/Firebase';

class Chat extends Model {
    constructor() {
        super();
    }

    static getRef() {
        return Firebase.db().collection('/chats');
    }

    static create(meEmail, contactEmail) {
        return new Promise((s, f) => {
            let users = {};
            users[btoa(meEmail)] = true;
            users[btoa(contactEmail)] = true;

            Chat.getRef().add({
                users,
                timestamp: new Date()
            }).then(doc => {
                Chat.getRef().doc(doc.id).get()
                    .then(chat => s(chat))
                    .catch(err => f(err));
            }).catch(err => f(err));
        });
    }

    static find(meEmail, contactEmail) {
        return Chat.getRef()
            .where(btoa(meEmail), '==', true)
            .where(btoa(contactEmail), '==', true)
            .get();
    }

    static createIfNotExists(meEmail, contactEmail) {
        return new Promise((s, f) => {
            Chat.find(meEmail, contactEmail).then(chats => {
                if (chats.empty) {
                    Chat.create(meEmail, contactEmail).then(chat => s(chat));
                } else {
                    chats.forEach(chat => s(chat));
                }
            }).catch(err => f(err));
        });
    }

    get users() {
        return this._data.users;
    }

    set users(users) {
        this._data.users = users;
    }

    get timestamp() {
        return this._data.timestamp;
    }

    set timestamp(timestamp) {
        this._data.timestamp = timestamp;
    }
}

export default Chat;
