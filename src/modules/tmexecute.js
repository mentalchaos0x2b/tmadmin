class TMExecute {
    static env = {
        directory: window.backend.directory(),
        modules: window.backend.modules()
    }

    static run(command) {
        window.backend.run(command);
    }

    static async execute(command) {
        const result = window.backend.execute(command);
        return result;
    }

    static async module(module, args = "") {
        const result = window.backend.executeModule(module, args);
        return result;
    }
}

export { TMExecute }