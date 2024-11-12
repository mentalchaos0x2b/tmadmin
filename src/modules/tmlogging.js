import crypto from 'crypto-js';
import os from 'os';

import * as fs from 'node:fs';

class TMLogging {

    env = {
        secret: null,
        hosts: {
            dir: "C:\\TMADMIN\\hosts",
            file: "C:\\TMADMIN\\hosts\\log.tmadmin",
            value: []
        }
    }

    constructor() { 
        this.env.secret = crypto.SHA256(os.hostname().toLowerCase()).toString();

        this.createFolders();
    }

    createFolders() {
        if(!fs.existsSync(this.env.hosts.dir)) fs.mkdirSync(this.env.hosts.dir, { recursive: true });
        if(!fs.existsSync(this.env.hosts.file)) {
            fs.writeFileSync(this.env.hosts.file, "");
            this.write();
            return;
        }

        this.env.hosts.value = this.get();
    }

    write() {
        const encrypted = crypto.AES.encrypt(JSON.stringify(this.env.hosts.value), this.env.secret).toString();

        fs.writeFileSync(this.env.hosts.file, encrypted);
    }

    get() {
        const encrypted = fs.readFileSync(this.env.hosts.file, 'utf8');
        const decrypted = crypto.AES.decrypt(encrypted, this.env.secret).toString(crypto.enc.Utf8);
        return JSON.parse(decrypted);
    }

    set(value) {
        this.env.hosts.value = value;
    }

    add(value) {
        this.env.hosts.value.push({
            to: value.host,
            from: os.hostname(),
            time: new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short' }).format(new Date()),
            response: value.response
        });

        this.write();
    }

    update() {
        
    }
}

export default new TMLogging();