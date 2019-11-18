import Format from '../utils/Format';
import CameraController from './CameraController';
import MicrophoneController from './MicrophoneController';
import DocumentPreviewController from './DocumentPreviewController';
import Firebase from '../utils/Firebase';
import User from '../models/User';

export default class WhatsAppController {
    constructor() {
        this._firebase = new Firebase();
        this.initAuth();
        this.loadElements();
        this.elementsPrototype();
        this.initEvents();
    }

    initAuth() {
        this._firebase.initAuth()
            .then(response => {
                this._user = new User(response.user.email);
                
                this._user.on('datachange', data => {
                    document.querySelector('title').innerHTML = `${data.name} - WhatsApp Clone`;

                    this.el.inputNamePanelEditProfile.innerHTML = data.name;
                    
                    if (data.photo) {
                        let photo = this.el.imgPanelEditProfile;
                        photo.src = data.photo;
                        photo.show();
                        this.el.imgDefaultPanelEditProfile.hide();

                        let photo2 = this.el.myPhoto.querySelector('img');
                        photo2.src = data.photo;
                        photo2.show();
                    }
                });

                this._user.name = response.user.displayName;
                this._user.email = response.user.email;
                this._user.photo = response.user.photoURL;

                this._user.save()
                    .then(() => this.el.appContent.css({ display: 'flex' }));
            }).catch(err => console.error(err))
    }

    loadElements() {
        this.el = {};

        document.querySelectorAll('[id]').forEach(element => {
            this.el[Format.getCamelCase(element.id)] = element;
        });
    }

    elementsPrototype() {
        Element.prototype.hide = function() {
            this.style.display = 'none';
            return this;
        }

        Element.prototype.show = function() {
            this.style.display = 'block';
            return this;
        }

        Element.prototype.toggle = function() {
            this.style.display = (this.style.display === 'none') ? 'block' : 'none';
            return this;
        }

        Element.prototype.on = function(events, fn) {
            events.split(' ').forEach(event => this.addEventListener(event, fn));
            return this;
        }

        Element.prototype.css = function(styles) {
            for (let name in styles) {
                this.style[name] = styles[name];
            }
            return this;
        }

        Element.prototype.addClass = function(className) {
            this.classList.add(className);
            return this;
        }

        Element.prototype.removeClass = function(className) {
            this.classList.remove(className);
            return this;
        }

        Element.prototype.toggleClass = function(className) {
            this.classList.toggle(className);
            return this;
        }

        Element.prototype.hasClass = function(className) {
            return this.classList.contains(className);
        }

        HTMLFormElement.prototype.getForm = function() {
            return new FormData(this);
        }

        HTMLFormElement.prototype.toJSON = function() {
            let json = {};
            this.getForm().forEach((value, key) => {
                json[key] = value;
            });
            return json;
        }
    }

    initEvents() {
        this.el.myPhoto.on('click', e => {
            this.closeAllLeftPanel();
            this.el.panelEditProfile.show();
            setTimeout(() => this.el.panelEditProfile.addClass('open'), 300);
        });

        this.el.btnClosePanelEditProfile.on('click', e => {
            this.el.panelEditProfile.removeClass('open');
        });

        this.el.btnNewContact.on('click', e => {
            this.closeAllLeftPanel();
            this.el.panelAddContact.show();
            setTimeout(() => this.el.panelAddContact.addClass('open'), 300);
        });

        this.el.btnClosePanelAddContact.on('click', e => {
            this.el.panelAddContact.removeClass('open');
        });

        this.el.photoContainerEditProfile.on('click', e => {
            this.el.inputProfilePhoto.click();
        });

        this.el.inputNamePanelEditProfile.on('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.el.btnSavePanelEditProfile.click();
            }
        });

        this.el.btnSavePanelEditProfile.on('click', e => {
            console.log(this.el.inputNamePanelEditProfile.innerHTML);
        });

        this.el.formPanelAddContact.on('submit', e => {
            e.preventDefault();
            let formData = this.el.formPanelAddContact.getForm();
        });

        this.el.contactsMessagesList.querySelectorAll('.contact-item').forEach(item => {
            item.on('click', e => {
                this.el.home.hide();
                this.el.main.css({
                    display: 'flex'
                });
            });
        });

        this.el.btnAttach.on('click', e => {
            e.stopPropagation();
            this.closeMenuAttachBinded = this.closeMenuAttach.bind(this)
            document.addEventListener('click', this.closeMenuAttachBinded);
            this.el.menuAttach.addClass('open');
        });

        this.el.inputPhoto.on('change', e => {
            console.log('inputPhoto', e.target.files);
            [...e.target.files].forEach(file => console.log('inputPhoto file', file));
        });

        this.el.btnAttachPhoto.on('click', e => {
            this.el.inputPhoto.click();
        });

        this.el.btnTakePicture.on('click', e => {
            this.el.pictureCamera.src = this._camera.takePicture();
            this.el.pictureCamera.show();
            this.el.videoCamera.hide();
            this.el.btnReshootPanelCamera.show();
            this.el.containerTakePicture.hide();
            this.el.containerSendPicture.show();
        });

        this.el.btnReshootPanelCamera.on('click', e => {
            this.el.pictureCamera.hide();
            this.el.videoCamera.show();
            this.el.btnReshootPanelCamera.hide();
            this.el.containerTakePicture.show();
            this.el.containerSendPicture.hide();
        });

        this.el.btnSendPicture.on('click', e => {
            console.log(this.el.pictureCamera.src)
        });

        this.el.btnClosePanelCamera.on('click', e => {
            this._camera.stop();
            this.closePanelShowMessages();
        });

        this.el.btnAttachCamera.on('click', e => {
            this.closeAllMainPanel();
            this.openPanelAdjustHeight(this.el.panelCamera);

            this._camera = new CameraController(this.el.videoCamera);
        });

        this.el.btnSendDocument.on('click', e => {
            console.log('send document');
        });

        this.el.btnClosePanelDocumentPreview.on('click', e => {
            this.closePanelShowMessages();
        });

        this.el.inputDocument.on('change', e => {
            if (this.el.inputDocument.files.length) {
                this.el.panelDocumentPreview.css({
                    height: '1%'
                });
                let file = this.el.inputDocument.files[0];
                this._documentPreviewController = new DocumentPreviewController(file);
                this._documentPreviewController.getPreviewData().then(result => {
                    this.el.imgPanelDocumentPreview.src = result.src;
                    this.el.infoPanelDocumentPreview.innerHTML = result.info;
                    this.el.imagePanelDocumentPreview.show();
                    this.el.filePanelDocumentPreview.hide();
                    this.el.panelDocumentPreview.css({
                        height: 'calc(100% - 120px)'
                    });
                }).catch(() => {
                    this.el.panelDocumentPreview.css({
                        height: 'calc(100% - 120px)'
                    });
                    switch(file.type) {
                        case 'application/vnd.ms-excel':
                        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                            this.el.iconPanelDocumentPreview.className = 'jcxhw-icon-doc-xls';
                            break;
                        case 'application/vnd.ms-powerpoint':
                        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                            this.el.iconPanelDocumentPreview.className = 'jcxhw-icon-doc-ppt';
                            break;
                        case 'application/msword':
                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            this.el.iconPanelDocumentPreview.className = 'jcxhw-icon-doc-doc';
                            break;
                        default:
                            this.el.iconPanelDocumentPreview.className = 'jcxhw-icon-doc-generic';
                    }
                    this.el.filenamePanelDocumentPreview.innerHTML = file.name;
                    this.el.imagePanelDocumentPreview.hide();
                    this.el.filePanelDocumentPreview.show();
                });
            }
        });

        this.el.btnAttachDocument.on('click', e => {
            this.closeAllMainPanel();
            this.openPanelAdjustHeight(this.el.panelDocumentPreview);
            this.el.inputDocument.click();
        });

        this.el.btnCloseModalContacts.on('click', e => {
            this.el.modalContacts.hide();
        });

        this.el.btnAttachContact.on('click', e => {
            this.el.modalContacts.show();
        });

        this.el.btnFinishMicrophone.on('click', e => {
            this._MicrophoneController.stopRecorder();
            this.closeRecordMicrophone();
        });

        this.el.btnCancelMicrophone.on('click', e => {
            this._MicrophoneController.stopRecorder();
            this.closeRecordMicrophone();
        });

        this.el.btnSendMicrophone.on('click', e => {
            this.el.recordMicrophone.show();
            this.el.btnSendMicrophone.hide();
            this._MicrophoneController = new MicrophoneController();

            this._MicrophoneController.on('ready', stream => {
                console.log('ready event', stream);
                this._MicrophoneController.startRecorder();
            });

            this._MicrophoneController.on('recordtimer', timer => {
                this.el.recordMicrophoneTimer.innerHTML = Format.toTime(timer);
            });
        });

        this.el.inputText.on('keypress', e => {
            if (e.key === 'Enter' && !e.ctrlKey) {
                e.preventDefault();
                this.el.btnSend.click();
            }
        });

        this.el.inputText.on('keyup', e => {
            if (this.el.inputText.innerHTML.length) {
                this.el.inputPlaceholder.hide();
                this.el.btnSendMicrophone.hide();
                this.el.btnSend.show();
            } else {
                this.el.inputPlaceholder.show();
                this.el.btnSendMicrophone.show();
                this.el.btnSend.hide();
            }
        });

        this.el.btnSend.on('click', e => {
            console.log('this.el.inputText.innerHTML', this.el.inputText.innerHTML);
        });

        this.el.btnEmojis.on('click', e => {
            this.el.panelEmojis.toggleClass('open');
        });

        this.el.panelEmojis.querySelectorAll('.emojik').forEach(emoji => {
            emoji.on('click', e => {
                let img = this.el.imgEmojiDefault.cloneNode();
                img.style.cssText = emoji.style.cssText;
                img.dataset.unicode = emoji.dataset.unicode;
                img.alt = emoji.dataset.unicode;
                img.className = emoji.className;
                
                let cursor = window.getSelection();
                if (!cursor.focusNode || !cursor.focusNode.id === 'input-text') {
                    this.el.inputText.focus();
                    cursor = window.getSelection();
                }

                let range = document.createRange();
                range = cursor.getRangeAt(0);
                range.deleteContents();

                let frag = document.createDocumentFragment();
                frag.appendChild(img);

                range.insertNode(frag);
                range.setStartAfter(img);

                this.el.inputText.dispatchEvent(new Event('keyup'));
            });
        });
    }

    openPanelAdjustHeight(panel) {
        panel.addClass('open');
        panel.css({
            height: 'calc(100% - 120px)'
        });
    }

    closeRecordMicrophone() {
        this.el.recordMicrophone.hide();
        this.el.btnSendMicrophone.show();
        this.el.recordMicrophoneTimer.innerHTML = '0:00';
    }

    closePanelShowMessages() {
        this.closeAllMainPanel();
        this.el.panelMessagesContainer.show();
    }

    closeMenuAttach(e) {
        this.el.menuAttach.removeClass('open');
        document.removeEventListener('click', this.closeMenuAttachBinded);
    }

    closeAllMainPanel() {
        this.el.panelMessagesContainer.hide();
        this.el.panelDocumentPreview.removeClass('open');
        this.el.panelCamera.removeClass('open');
    }

    closeAllLeftPanel() {
        this.el.panelAddContact.hide();
        this.el.panelEditProfile.hide();
    }
}