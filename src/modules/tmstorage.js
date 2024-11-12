class TMStorage {
    static environment = {
        conatiner: "tmstorage",
        ifNull: "N/A",
        notepad: {
            toolbarOptions: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
              ]
        }
    }

    static generateCellName(key) {
        return `${this.environment.conatiner}_${key}`;
    }

    static getStorage() {
        const local = localStorage;

        const object = { }

        for(const key in local) {
            if(key.startsWith(this.environment.conatiner)) {
                object[key] = local[key];
            }
        }

        return object;
    }

    static get(key, ifNull = null) {
        if(ifNull !== null) return localStorage.getItem(this.generateCellName(key)) || ifNull;

        return localStorage.getItem(this.generateCellName(key)) || this.environment.ifNull;
    }

    static set(key, value) {
        localStorage.setItem(this.generateCellName(key), value);

        return {
            key: this.generateCellName(key),
            value: value
        }
    }

    static remove(key) {
        localStorage.removeItem(this.generateCellName(key));
    }

    static clear() {
        localStorage.clear();
    }

    static getNotepadToolbarOptions() { return this.environment.notepad.toolbarOptions; }
}

export { TMStorage }