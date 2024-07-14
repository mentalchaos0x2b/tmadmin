/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { TMLog } from './modules/tmlog';

import { TMStorage } from './modules/tmstorage';
import { TMJS } from './modules/tmjs';
import { TMView, ViewNotepad, ViewControl } from './modules/tmviews';

import feather from 'feather-icons';

import Quill from 'quill';
import 'quill/dist/quill.bubble.css';

import './xrkit.css'
import './index.css';

const text = "123";

TMJS.documentReady(() => {

    // MAIN MODULES INIT

    feather.replace();

    TMView.initDocument();

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

});

export {text};