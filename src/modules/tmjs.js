class TMJS {
    static listen(object, event, callback) {
        const elements = document.querySelectorAll(object);

        for (const element of elements) {
            element.addEventListener(event, (e) => { callback(e); });
        }
    }

    static select(object, callback) {
        const elements = document.querySelectorAll(object);

        for (const element of elements) {
            callback(element);
        }
    }
    static selectOne(object, callback) {
        const element = document.querySelector(object);

        callback(element);
    }
}

export { TMJS }