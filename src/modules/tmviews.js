import { TMJS } from './tmjs';
import { TMStorage } from './tmstorage';
import { TMExecute } from './tmexecute';

import * as pkg from '../../package.json';
import { TMLog } from './tmlog';

import MarkdownIt, * as md from 'markdown-it';

const global = {  }

global.api = {};
global.api.faq = "http://10.15.11.254:7893/";

class TMView {
    static env = {
        appName: "TMAdmin",
        appVersion: pkg.version
    }

    static hideViews() {
        TMJS.select( 'view', (e) => {
            e.style.display = "none";
        });
    }

    static setView( view ) {
        this.hideViews();

        document.querySelector( 'view[data-view="' + view + '"]' ).style.display = "flex";

        this.setActiveMenuButton( '.xr-menu-button[data-view="' + view + '"]' );

        const viewEvent = new CustomEvent('view-change', { detail: { view: view} });

        document.dispatchEvent( viewEvent );
    }

    static setActiveMenuButton(element) {
        TMJS.select( '.xr-menu-button', (e) => {
            e.classList.remove( 'xr-menu-active' );
        });

        TMJS.selectOne( element, (e) => {
            e.classList.add( 'xr-menu-active' );
        });
        
    }

    static initDocument() {

        TMView.title( `${this.env.appVersion}` );

        TMView.setView( 'control' );

        TMJS.listen( '.xr-menu-button', 'click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            TMView.setView( view );
        });
    }

    static title(version, subtitle = null) {
        if(subtitle === null) document.title = `${this.env.appName} ${version}`;
        else document.title = `${this.env.appName} ${version} - ${subtitle}`;
    }

    static setBuild(build) {
        TMJS.get('build-label').innerHTML = `pre-${build}`;
        TMJS.listen('build', 'click', (e) => {
            window.backend.open(`https://github.com/nxghtmxre0xf/tmadmin/releases/tag/v${build}`)
        });
    }
}

class ViewNotepad  {
    static init(init, callback) {
        init();
        
        TMJS.timer(() => {
            callback();
        }, 100);
    }
}

class ViewControl {
    static modules = {
        vnc: {
            file: 'vnc.exe',
            object: '.module-vnc'
        },
        open: {
            file: 'open.exe',
            object: null
        },
        psexec: {
            file: 'psx.exe',
            object: '.module-psexec'
        },
        rdp: {
            file: null,
            object: '.module-rdp'
        },
        card: {
            file: 'cards.exe',
            object: '.module-card'
        },
        spaceSniffer: {
            file: 'space.exe',
            object: '.module-space-sniffer'
        },
        journal: {
            file: null,
            object: '.module-journal'
        },
        printers: {
            file: 'printers.lnk',
            object: '.module-printers'
        },
        nsl: {
            file: 'nsg.exe',
            object: '.module-nsl'
        }
    }

    static init() {
        
        TMJS.selectOne('control-loader', (element) => {
            TMJS.animateShow(element, 0.95);
        });

        TMJS.hide('control-loader .xr-loading');
        TMJS.show('control-loader .xr-label');

        TMJS.html('control-loader .xr-label', "Ожидание пользователя");

        this.setInputEvent();

        this.setButtonHandlers();
    }

    static showLoader() {
        TMJS.selectOne('control-loader', (element) => {
            TMJS.animateShow(element, 0.8);
        });
    }

    static hideLoader() {
        TMJS.selectOne('control-loader', (element) => {
            TMJS.animateHide(element);
        });
    }

    static setInputEvent() {
        TMJS.listen('.control-host', 'keyup', (e) => {
            if( e.key === 'Enter' ) {
                this.pingHost();
            }
        });
        TMJS.listen('.control-refresh', 'click', (e) => {
            this.pingHost();
        });

        TMJS.listen('.control-host', 'input', (e) => {
            TMJS.selectOne('control-loader', (element) => {
                TMJS.animateShow(element, 0.95);
            });

            TMJS.hide('control-loader .xr-loading');
            TMJS.show('control-loader .xr-label');

            TMJS.html('control-loader .xr-label', "Ожидание пользователя");
        });
    }

    static getHostValue() {
        return TMJS.value('.control-host');
    }

    static async pingHost() {
        TMJS.html('control-loader .xr-label', "Хост недоступен");

        TMJS.attribute('.control-host', 'disabled', true);
        TMJS.attribute('.control-refresh', 'disabled', true);

        this.showLoader();
        TMJS.show('control-loader .xr-loading');
        TMJS.hide('control-loader .xr-label');

        const output = await TMExecute.moduleAsync("ping.exe", this.getHostValue());
        
        TMJS.deleteAttribute('.control-host', 'disabled');
        TMJS.deleteAttribute('.control-refresh', 'disabled');

        this.getLAPS();

        if( output.stdout.toLowerCase() !== "true" ) {
            TMJS.hide('control-loader .xr-loading');
            TMJS.show('control-loader .xr-label');

            TMJS.selectOne('control-loader', (element) => {
                TMJS.animateShow(element, 0.95);
            });

            return;
        }

        this.hideLoader();
    }

    static async getLAPS() {
        const output = await TMExecute.moduleAsync("LAPS.exe", this.getHostValue());
        TMJS.value('.control-laps', output.stdout);
    }

    static async setButtonHandlers() {
        TMJS.listen('.module-vnc', 'click', async (e) => {
            TMLog.show("none", "TightVNC: Запуск", true, 3000, 'external-link');
            if(ViewSettings.props.vncAutoPassword.storage.get()) {
                const vncPassword = await window.backend.vncPassword();
                await TMExecute.moduleAsync(this.modules.vnc.file, `${this.getHostValue()} -PASSWORD=${vncPassword}`);
            }
            else {
                await TMExecute.moduleAsync(this.modules.vnc.file, this.getHostValue());
            }
            TMLog.show("none", "TightVNC: Работа прекращена", true, 3000, 'external-link');
        });
        TMJS.listen('.module-psexec', 'click', (e) => {
            TMLog.show("none", "PSExec: Запуск", true, 3000, 'external-link');
            TMExecute.start(this.modules.psexec.file, `\\\\${this.getHostValue()} cmd`);
        });
        TMJS.listen('.module-rdp', 'click', (e) => {
            TMLog.show("none", "RDP: Запуск", true, 3000, 'external-link');
            TMExecute.executeAsync(`mstsc /v:${this.getHostValue()}`);
        });
        TMJS.listen('.module-nsl', 'click', (e) => {
            TMLog.show("none", "NSL: Запуск", true, 3000, 'external-link');
            TMExecute.start(this.modules.nsl.file);
        });
        TMJS.listen('.module-card', 'click', async (e) => {
            const host = this.getHostValue();

            TMLog.show("none", `Поиск карточки ${host}`, true, 3000, 'search');

            const output = await TMExecute.moduleAsync(this.modules.card.file, `-find ${host}`);

            console.log(output);

            if ( output.stdout.toLowerCase().startsWith("error") ) return TMLog.show("bad", `Ошибка: ${output.stdout.substring(7, output.stdout.length)}`, true, 3000, 'alert-triangle');

            TMLog.show("none", `Карточка найдена`, true, 3000, 'check');
        });
        TMJS.listen('.module-space-sniffer', 'click', async (e) => {
            TMLog.show("none", `Space Sniffer: Запуск`, true, 3000, 'external-link');
            const res = await TMExecute.moduleAsync(this.modules.spaceSniffer.file, `scan \\\\${this.getHostValue()}\\${TMJS.value('.module-space-sniffer-disk') || "c"}$`);
            TMLog.show("none", `Space Sniffer: Работа прекращена`, true, 3000, 'external-link');
        });
        TMJS.listen('.module-journal', 'click', (e) => {
            
        });
        TMJS.listen('.module-compmgmt', 'click', (e) => {
            TMLog.show("none", `Computer Management: Запуск`, true, 3000, 'external-link');
            TMExecute.executeAsync("compmgmt", `/COMPUTER=${this.getHostValue()}`);
        });
        TMJS.listen('.module-printers', 'click', (e) => {
            TMExecute.moduleSync(this.modules.printers.file);
        });
    }
}

class ViewSettings {
    static props = {
        vncAutoPassword: {
            input: '[data-setting="vnc-auto-password"]',
            storage: {
                get: () => eval(TMStorage.get('vnc-auto-password', true)),
                set: (value) => TMStorage.set('vnc-auto-password', value)
            },
            display_name: 'vnc-auto-password'
        },
        alwaysOnTop: {
            input: '[data-setting="always-on-top"]',
            storage: {
                get: () => eval(TMStorage.get('always-on-top', false)),
                set: (value) => TMStorage.set('always-on-top', value)
            },
            display_name: 'always-on-top'
        },
        reset: {
            input: '[data-setting="reset"]',
            action: () => TMStorage.clear()
        }
    }

    static init() {
        this.toggleInit();
        this.setToggleHandlers();
    }

    static alwayOnTopInit() {
        window.backend.alwaysOnTop(TMJS.get(this.props.alwaysOnTop.input).checked);
    }

    static toggleInit() {
        TMJS.get(this.props.vncAutoPassword.input).checked = this.props.vncAutoPassword.storage.get();
        TMJS.get(this.props.alwaysOnTop.input).checked = this.props.alwaysOnTop.storage.get();

        this.alwayOnTopInit();
    }

    static setToggleHandlers() {
        TMJS.listen(this.props.vncAutoPassword.input, 'change', (e) => {
            const checked = e.currentTarget.checked;
            this.props.vncAutoPassword.storage.set(checked);
            const num = checked ? 1 : 0;
            TMLog.show('none', `Настройка изменена: ${this.props.vncAutoPassword.display_name} = ${num}`, true, 3000, 'settings');
        });

        TMJS.listen(this.props.alwaysOnTop.input, 'change', (e) => {
            const checked = e.currentTarget.checked;
            this.props.alwaysOnTop.storage.set(checked);
            const num = checked ? 1 : 0;
            TMLog.show('none', `Настройка изменена: ${this.props.alwaysOnTop.display_name} = ${num}`, true, 3000, 'settings');

            this.alwayOnTopInit();
        });

        TMJS.listen(this.props.reset.input, 'click', (e) => {
            TMLog.show('none', `Настройки успешно сброшены`, true, 3000, 'settings');
            this.props.reset.action();

            this.toggleInit();
        });
    }
}

global.viewUpdate = { }
global.viewUpdate.first = true;

class ViewUpdate {
    static url = {
        apiReleases: 'https://api.github.com/repos/nxghtmxre0xf/tmadmin/releases',
        releases: 'https://github.com/nxghtmxre0xf/tmadmin/releases'
    }

    static async init(fromButton = false) {

        this.unsetError();

        this.showLoader();

        let res;

        try {
            res = await this.getRelease();
        }
        catch {
            this.setError();
            return;
        }

        try {
            const md = new MarkdownIt();

            TMJS.get('release').innerHTML = md.render(res.body);
        }
        catch {
            TMJS.get('release').innerHTML = "Текст обновления не найден";
        }

        TMJS.get('[data-view="current-version"]').innerHTML = `v${pkg.version}`;
        TMJS.get('[data-view="git-version"]').innerHTML = res.tag_name;

        this.versionCompare(pkg.version, res.tag_name, fromButton);

        if( global.viewUpdate.first ) {
            this.setButtonHandler(res.assets[2].browser_download_url);
            global.viewUpdate.first = false;
        }

        this.hideLoader();
    }

    static versionCompare(current, git, fromButton = false) {
        if(this.convertVersion(git) > this.convertVersion(current)) {
            if(global.viewUpdate.first || fromButton) TMLog.show('none', `Доступна новая версия: ${git}`, true, 3000, 'upload');

            TMJS.get('[data-view="update-info"]').innerHTML = `Доступна новая версия: ${git}`;

            TMJS.get('[data-view="update-window"]').style.display = 'flex';
            TMJS.get('[data-view="check-update-window"]').style.display = 'none';
        }
        else {
            TMJS.get('[data-view="update-info"]').innerHTML = `Обновление не требуется`;
            TMJS.get('[data-view="update-window"]').style.display = 'none';
            TMJS.get('[data-view="check-update-window"]').style.display = 'flex';

            if(global.viewUpdate.first || fromButton) TMLog.show('none', `Обновление не найдено`, true, 3000, 'check');
        }
    }

    static showLoader() {
        TMJS.selectOne('update-loader', (element) => {
            TMJS.animateShow(element, 1);
        });
    }

    static hideLoader() {
        TMJS.selectOne('update-loader', (element) => {
            TMJS.animateHide(element, 0);
        });
    }

    static setError() {
        TMJS.get('update-loader').innerHTML = `<p class="span-accent">Ошибка при запросе к серверу обновления</p>`;
        this.showLoader();
    }

    static unsetError() {
        const html = `<div class="xr-loading"><span class="xr-loading-item"></span><span class="xr-loading-item"></span><span class="xr-loading-item"></span></div><p class="span-accent">Запрос к серверу обновления</p>`
        TMJS.get('update-loader').innerHTML = html;
        this.showLoader();
    }

    static convertVersion(version) {
        const ver = version.replace('v', '').split('.');

        ver[0] = Number(ver[0]) * 10000;
        ver[1] = Number(ver[1]) * 1000;
        ver[2] = Number(ver[2]) * 100;

        return Number(this.sum(ver));
    }

    static sum(array) {
        return array.reduce((a, b) => a + b, 0);
    }

    static async getRelease() {
        const response = await fetch(this.url.apiReleases);
        const data = await response.json();
        // console.log(data[0]);
        return data[0];
    }

    static setButtonHandler(asset) {
        TMJS.listen('[data-action="download-update"]', 'click', (e) => {
            window.backend.open(asset);
        });
        TMJS.listen('[data-action="check-update"]', 'click', (e) => {
            this.init(true);
        });
    }
}

global.viewFaq = { }
global.viewFaq.first = true;
global.viewFaq.cache = [];

class ViewFaq {

    static init() {
        TMJS.animateShow(TMJS.get('faq-loader'), 0);

        this.initCards();

        if(!global.viewFaq.first) return;

        TMJS.listen('.faq-search-button', 'click', (e) => {
            this.search(); 
        });

        TMJS.listen('.faq-search-value', 'keyup', (e) => {
            if(e.key == "Enter") this.search(); 
        });

        TMJS.listen('.add-faq', 'click', (e) => {
            window.backend.open(global.api.faq);
        });

        global.viewFaq.first = false;
    }

    static async initCards() {
        TMJS.empty('faq-container');

        await this.getAll();

        this.generateCards();

        TMJS.animateHide(TMJS.get('faq-loader'), 0);
    }

    static async search() {
        TMJS.animateShow(TMJS.get('faq-loader'), 0);
        TMJS.empty('faq-container');

        global.viewFaq.cache = await fetch(global.api.faq + "api/search?s=" + TMJS.value('.faq-search-value')).then(res => res.json());

        if(global.viewFaq.cache.length > 0) this.generateCards();
        else TMJS.get('faq-container').innerHTML = `<p class="span-accent">Ничего не найдено</p>`;
        TMJS.animateHide(TMJS.get('faq-loader'), 0);
    }

    static async getAll() {
        global.viewFaq.cache = await fetch(global.api.faq + "api/get").then(res => res.json());
        if(global.viewFaq.cache.length == 0) TMJS.get('faq-container').innerHTML = `<p class="span-accent">Статьи не найдены, напишите статью первым</p>`;
    }

    static generateCards = () => {
        global.viewFaq.cache.forEach((element) => {
           TMJS.get('faq-container').innerHTML += this.card(element.title, element.description, element.author, element.id); 
        });
    }

    static setTargetDetail(target) {
        TMJS.select('faq-container details', (element) => {
            if(element != target) element.open = false; 
        });
    }

    static card(title, description, author, id) {
        return `
        <faq-item>
            <details>
              <summary>${title}</summary>
              <faq-description>
                ${description}
                <div class="faq-author">
                    
                    <p>Создано: ${author}</p>
                    <button class="xr-button faq-edit" onclick="window.backend.open('http:\/\/10.15.11.254:7893\/edit\/${id}')">Изменить</button>
                </div>
              </faq-description>
            </details>
        </faq-item>
        `;
    }
}

export { TMView, ViewNotepad, ViewControl, ViewSettings, ViewUpdate, ViewFaq };