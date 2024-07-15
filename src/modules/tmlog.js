import { TMJS } from './tmjs';
import feather from 'feather-icons';

class TMLog {
    static type = {
        bad: 'bad',
        alert: 'alert',
        ok: 'ok',
        none: ''
    }

    static uniqueId() {
        return Date.now();
    }

    static show(type, message, autoRemove = false, removeTime = 3000, featherIcon = null) {
        const id = this.uniqueId();

        let featherString = ""

        if(featherIcon !== null) featherString = `<i data-feather="${featherIcon}"></i>`

        TMJS.append('log', 
        `<log-message data-id="${id}" onclick="removeItem(this)" class="log-${type}">
            ${featherString}
            <p>${message}</p>
        </log-message>`);
        
        if(featherIcon !== null) feather.replace();

        const element = TMJS.get(`[data-id="${id}"]`);

        if(autoRemove) TMJS.timeout(() => {
            try { this.removeItemId(id); } catch { }
        }, removeTime);
    }

    static removeItem(e) {
        e.style.animation = "log-hide .5s 1 forwards";
        TMJS.timeout(() => {
            e.remove();
        }, 500);
    }

    static removeItemId(id) {
        const element = TMJS.get(`[data-id="${id}"]`);

        element.style.animation = "log-hide .5s 1 forwards";
        TMJS.timeout(() => {
            try { element.remove(); } catch { }
        }, 500);
    }
}

export { TMLog }