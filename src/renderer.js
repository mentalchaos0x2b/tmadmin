import { TMLog } from './modules/tmlog';

import { TMStorage } from './modules/tmstorage';
import { TMJS } from './modules/tmjs';
import { TMView, ViewNotepad, ViewControl, ViewSettings, ViewUpdate, ViewFaq } from './modules/tmviews';

import feather from 'feather-icons';

import * as pkg from '../package.json';

import Quill from 'quill';
import 'quill/dist/quill.bubble.css';

import './xrkit.css'
import './index.css';

TMJS.documentReady(async () => {
    // MAIN MODULES INIT

    feather.replace();

    TMView.initDocument();

    TMView.setBuild(pkg.version);

    const quill = new Quill(".xr-notepad", {
        modules: {
            toolbar: TMStorage.getNotepadToolbarOptions()
        },
        theme: "bubble",
        placeholder: "Напишите текст",
        bounds: ".xr-notepad"
    });

    // VIEWS INIT AND LOGIC

    ViewNotepad.init(() => quill.root.innerHTML = TMStorage.get('notepad', ''), () => {
        TMStorage.set('notepad', quill.getSemanticHTML());
    });

    ViewControl.init();

    ViewSettings.init();

    view_control = ViewControl;

    TMJS.eventObj(document, 'view-change', (e) => {
        if(e.detail.view == 'update') {
            ViewUpdate.init();
        }

        if(e.detail.view == 'faq') {
            ViewFaq.init();
        }
    });      
});