import { TMLog } from './tmlog';

class TMExecute {
    static env = {
        directory: window.backend.directory(),
        modules: window.backend.modules()
    }

    static run(command) {
        window.backend.run(command);
    }

    static async executeAsync(command, args = "") {
        const result = window.backend.execute(command, args);
        return result;
    }

    static async moduleAsync(module, args = "") {
        const result = await window.backend.executeModule(module, args);
        return result;
    }

    static async moduleSync(module, args = "") {
        window.backend.executeModule(module, args);
    }

    static async start(module, args = "") {
        window.backend.start(module, args);
    }
}

export { TMExecute }