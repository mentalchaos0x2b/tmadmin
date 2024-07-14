import { TMJS } from './tmjs';

class TMLog {
    static type = {
        bad: 'log-bad',
        alert: 'log-alert',
        ok: 'log-ok',
        none: ''
    }

    static uniqueId() {
        return Date.now();
    }

    static show(type, message, autoRemove = false, removeTime = 3000) {
        const id = this.uniqueId();

        TMJS.append('log', 
        `<log-message data-id="${id}" onclick="removeItem(this)" class="log-${type}">
            <p>${message}</p>
        </log-message>`);
        
        const element = TMJS.get(`[data-id="${id}"]`);

        if(autoRemove) TMJS.timeout(() => this.removeItem(element), removeTime)

    }

    static removeItem(e) {
        e.style.animation = "log-hide .5s 1 forwards";
        TMJS.timeout(() => {
            e.remove();
        }, 500);
    }
}

export { TMLog }