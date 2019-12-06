import Firebase from './Firebase';

class Upload {
    static send(file, from) {
        return new Promise((s, f) => {
            let fileRef = `${Date.now}_${file.name}`;
            let uploadTask = Firebase.hd().ref(from).child(fileRef).put(file);

            uploadTask.on('state_changed',
                e => console.log(`FILE UPLOAD: ${file.name}`, e),
                err => f(err),
                () => Firebase.hd().ref(from).child(fileRef).getDownloadURL()
                    .then(url => s(url)));
        });
    }
}

export default Upload;
