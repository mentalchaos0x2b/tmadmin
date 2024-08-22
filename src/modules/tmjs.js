class TMJS {
    static listen(object, event, callback) {
        const elements = document.querySelectorAll(object);

        for (const element of elements) {
            element.addEventListener(event, (e) => { callback(e); });
        }
    }

    static event(object, event, callback) {
        const element = document.querySelector(object);

        element.addEventListener(event, (e) => { callback(e); });
    }
    static eventObj(object, event, callback) {
        object.addEventListener(event, (e) => { callback(e); });
    }

    static select(object, callback) {
        const elements = document.querySelectorAll(object);

        for (const element of elements) {
            callback(element);
        }
    }

    static get(object) {
        return document.querySelector(object);
    }

    static selectOne(object, callback) {
        const element = document.querySelector(object);

        callback(element);
    }

    static value(object, value = null) {
        if(value === null) return document.querySelector(object).value;

        document.querySelector(object).value = value;
    }

    static documentReady(callback) {
        document.addEventListener('DOMContentLoaded', () => {
            callback();
        });
    }

    static timer(callback, interval, firstRun = false) {
        if (firstRun) callback();
        setInterval(() => {
           callback(); 
        }, interval);
    }

    static timeout(callback, timeout) {
        setTimeout(() => {
           callback(); 
        }, timeout);
    }

    static animateHide(element, opacity = null) {
        element.style.pointerEvents = "none";
        element.style.opacity = opacity ? `${opacity}` : "0";
    }

    static animateShow(element, opacity = null) {
        element.style.pointerEvents = "all";
        element.style.opacity = opacity ? `${opacity}` : "1";
    }

    static attribute(object, attribute, value = null) {
        const element = document.querySelector(object);
        if(value === null) return element.getAttribute(attribute);
        element.setAttribute(attribute, value);
    }

    static deleteAttribute(object, attribute) {
        const element = document.querySelector(object);
        element.removeAttribute(attribute);
    }

    static hide(object) {
        const element = document.querySelector(object);
        element.style.display = "none";
    }

    static show(object) {
        const element = document.querySelector(object);
        element.style.display = "flex";
    }

    static html(object, html) {
        const element = document.querySelector(object);
        element.innerHTML = html;
    }

    static append(object, html) {
        const element = document.querySelector(object);
        element.innerHTML += html;
        return element.childNodes;
    }

    static create(element) {
        return document.createElement(element);
    }

    static style(object, style, value = null) {
        const element = document.querySelector(object);
        if(value === null) return element.style[style];
        element.style[style] = value;
    }

    static empty(object) {
        const element = document.querySelector(object);
        element.innerHTML = "";
    }
}

export { TMJS }