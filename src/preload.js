// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { exec, spawn } from 'node:child_process';
import { promisify } from 'util';
import path from 'node:path';

const dev = false;

const execAsync = promisify(exec);
const spawnAsync = promisify(spawn);

const dirs = {
    dev: {
        src: () => { return path.join(__dirname, '../../src'); },
        modules: () => { return path.join(__dirname, '../../resources/modules'); },
    },
    prod: {
        src: () => { return path.join(__dirname, '../../../src'); },
        modules: () => { return path.join(__dirname, '../../../modules'); },
    }
}

const dir = () => {
    return {
        src: dev ? dirs.dev.src() : dirs.prod.src(),
        modules: dev ? dirs.dev.modules() : dirs.prod.modules()
    }
}

contextBridge.exposeInMainWorld('backend', {
    run: (command) => {
        exec(command);
    },
    execute: async (command) => {
        const {err, stdout, stderr} = await execAsync(command);
        return {
            err,
            stdout,
            stderr
        }
    },
    executeModule: async (module, args = "") => {
        
        console.log(dir().modules);

        const {err, stdout, stderr} = await execAsync(`${path.join(dir().modules, module)} ${args}`);
        return {
            err,
            stdout,
            stderr
        }
    },
    directory: () => dir().src,
    modules: () => dir().modules,
});