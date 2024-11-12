import { contextBridge, ipcRenderer, shell } from 'electron';
import { exec, execFile } from 'node:child_process';
import { promisify } from 'util';
import path from 'node:path';

import { isPackaged } from 'electron-is-packaged';

import logging from "./modules/tmlogging"

const execAsync = promisify(exec);
const invoke = promisify(ipcRenderer.invoke);

const dirs = {
    dev: {
        src: () => { return path.join(__dirname, '../../src'); },
        modules: () => { return path.join(__dirname, '../../src/assets/modules'); },
    },
    prod: {
        src: () => { return path.join(__dirname, '../../../src'); },
        modules: () => { return path.join(__dirname, '../../../modules'); },
    }
}

const dir = {
    src: isPackaged ? dirs.prod.src() : dirs.dev.src(),
    modules: isPackaged ?  dirs.prod.modules() : dirs.dev.modules()
}

contextBridge.exposeInMainWorld('backend', {
    log: {
        get: () => logging.get(),
        set: (value) => logging.set(value),
        add: (value) => logging.add(value),
    },
    run: (command) => {
        exec(command);
    },
    execute: async (command, args = "") => {
        const {err, stdout, stderr} = await execAsync(`${command} ${args}`);
        return {
            err,
            stdout,
            stderr
        }
    },
    executeModule: async (module, args = "") => {

        const {err, stdout, stderr} = await execAsync(`${path.join(dir.modules, module)} ${args}`);

        return {
            err,
            stdout,
            stderr
        }
    },
    start: async (module, args = "") => {

        const {err, stdout, stderr} = await execAsync(`start ${path.join(dir.modules, module)} ${args}`);

        return {
            err,
            stdout,
            stderr
        }
    },
    open: async (url) => shell.openExternal(url),
    directory: () => dir.src,
    modules: () => dir.modules,
    vncPassword: async () => { 
        const res = await ipcRenderer.invoke('vnc_password');
        return res;
    },
    alwaysOnTop: async (arg) => ipcRenderer.send('always_on_top', arg),
    verifyBatModulesAndCopy() {

    }
});