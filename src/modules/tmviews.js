import { TMJS } from './tmjs';
import { TMStorage } from './tmstorage';
import { TMExecute } from './tmexecute';

import * as pkg from '../../package.json';
import { TMLog } from './tmlog';

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

        TMView.title( `${this.env.appVersion} [alpha-build | early-access]` );

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

    static disableInput() {

    }

    static enableInput() {

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

        if( output.stdout.toLowerCase() !== "true" ) {
            TMJS.hide('control-loader .xr-loading');
            TMJS.show('control-loader .xr-label');

            TMJS.selectOne('control-loader', (element) => {
                TMJS.animateShow(element, 0.95);
            });

            return;
        }

        this.hideLoader();

        this.getLAPS();
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
        reset: {
            input: '[data-setting="reset"]',
            action: () => TMStorage.clear()
        }
    }

    static init() {
        this.toggleInit();
        this.setToggleHandlers();
    }

    static toggleInit() {
        TMJS.get(this.props.vncAutoPassword.input).checked = this.props.vncAutoPassword.storage.get();
    }

    static setToggleHandlers() {
        TMJS.listen(this.props.vncAutoPassword.input, 'change', (e) => {
            const checked = e.currentTarget.checked;
            this.props.vncAutoPassword.storage.set(checked);
            const num = checked ? 1 : 0;
            TMLog.show('none', `Настройка изменена: ${this.props.vncAutoPassword.display_name} = ${num}`, true, 3000, 'settings');
        });
        TMJS.listen(this.props.reset.input, 'click', (e) => {
            TMLog.show('none', `Настройки успешно сброшены`, true, 3000, 'settings');
            this.props.reset.action();

            this.toggleInit();
        });
    }
}

export { TMView, ViewNotepad, ViewControl, ViewSettings };