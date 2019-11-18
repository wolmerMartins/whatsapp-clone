const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/storage');
require('firebase/auth');

class Firebase {
    constructor() {
        this._config = {
            apiKey: "AIzaSyCeurRgZ3Xr-N0g4Dg2M62dVoNr3UXZcn8",
            authDomain: "whatsapp-clone-609c4.firebaseapp.com",
            databaseURL: "https://whatsapp-clone-609c4.firebaseio.com",
            projectId: "whatsapp-clone-609c4",
            storageBucket: "whatsapp-clone-609c4.appspot.com",
            messagingSenderId: "739707867574",
            appId: "1:739707867574:web:0f13e45d0378b31603b117"
        };
        this.init();
    }

    init() {
        if (!window._initializedFirebase) {
            firebase.initializeApp(this._config);
            window._initializedFirebase = true;
        }
    }

    initAuth() {
        return new Promise((s, f) => {
            let provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(result => {
                    let token = result.credential.accessToken;
                    let user = result.user;
                    
                    s({ user, token });
                }).catch(err => console.error(err));
        });
    }

    static db() {
        return firebase.firestore();
    }

    static hd() {
        return firebase.storage();
    }
}

export default Firebase;