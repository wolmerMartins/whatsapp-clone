import ClassEvent from '../utils/ClassEvent';

class MicrophoneController extends ClassEvent {
    constructor() {
        super();

        this._available = false;
        this._mimeType = 'audio/webm';

        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream => {
            this._available = true;
            this._stream = stream;

            this.trigger('ready', this._stream);
        }).catch(err => console.log(err));
    }

    isAvailable() {
        return this._available;
    }

    stop() {
        this._stream.getTracks().forEach(track => track.stop());
    }

    startRecorder() {
        if (this.isAvailable()) {
            this._mediaRecorder = new MediaRecorder(this._stream, {
                mimeType: this._mimeType
            });
            this._recordedChunk = [];
            
            this._mediaRecorder.addEventListener('dataavailable', e => {
                if (e.data.size > 0) this._recordedChunk.push(e.data);
            });
            
            this._mediaRecorder.addEventListener('stop', e => {
                let blob = new Blob(this._recordedChunk, {
                    type: this._mimeType
                });
                let filename = `rec_${Date.now()}.webm`;
                let audioContext = new AudioContext();
                let reader = new FileReader();
                reader.onload = e => {
                    audioContext.decodeAudioData(reader.result).then(decode => {
                        let file = new File([blob], filename, {
                            type: this._mimeType,
                            lastModified: Date.now()
                        });

                        this.trigger('recorded', file, decode);
                    });
                };
                reader.readAsArrayBuffer(blob);
            });

            this._mediaRecorder.start();
            this.startTimer();
        }
    }

    stopRecorder() {
        if (this.isAvailable()) {
            this._mediaRecorder.stop();
            this.stop();
            this.stopTimer();
        }
    }

    startTimer() {
        let start = Date.now();
        this._recordMicrophoneInterval = setInterval(() => {
            this.trigger('recordtimer', (Date.now() - start));
        }, 100);
    }

    stopTimer() {
        clearInterval(this._recordMicrophoneInterval);
    }
}

export default MicrophoneController
