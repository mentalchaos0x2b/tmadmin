import { contextBridge, ipcRenderer, shell } from 'electron';
import { exec, execFile } from 'node:child_process';
import { promisify } from 'util';
import path from 'node:path';

import * as fs from 'node:fs';

import { isPackaged } from 'electron-is-packaged';

import crypto from 'crypto';

import os from 'os';

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

const log = {
    key: crypto.Hash('sha256').update(os.hostname()).digest('hex'),
    hosts: {
        dir: "C:\\TMADMIN\\hosts",
        file: "C:\\TMADMIN\\hosts\\log.tmadmin",
        value: []
    }
}

const hostsLog = {
    get() {
        
    },
   set() {
        
    }
}

contextBridge.exposeInMainWorld('backend', {
    createLogFiles() {
        if(!fs.existsSync(log.hosts.dir)) fs.mkdirSync(log.hosts.dir, { recursive: true });
        if(!fs.existsSync(log.hosts.file)) fs.writeFileSync(log.hosts.file, "");

        console.log(hostsLog.get());
        console.log(hostsLog.set());
        
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