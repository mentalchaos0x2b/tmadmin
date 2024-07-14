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
        TMJS.listen('.module-vnc', 'click', (e) => {
            TMExecute.moduleSync(this.modules.vnc.file, this.getHostValue());
            TMLog.show("none", "TightVNC Запущен", true, 3000);
        });
        TMJS.listen('.module-psexec', 'click', (e) => {
            TMExecute.start(this.modules.psexec.file, `\\\\${this.getHostValue()} cmd`);
            TMLog.show("none", "PSExec Запущен", true, 3000);
        });
        TMJS.listen('.module-rdp', 'click', (e) => {
            TMExecute.executeAsync(`mstsc /v:${this.getHostValue()}`);
        });
        TMJS.listen('.module-card', 'click', async (e) => {
            const output = TMExecute.moduleAsync(this.modules.card.file, `-find ${this.getHostValue()}`);

            TMLog.show("none", JSON.stringify(output), true, 3000);
        });
        TMJS.listen('.module-space-sniffer', 'click', (e) => {
            TMExecute.moduleSync(this.modules.spaceSniffer.file, this.getHostValue());
        });
        TMJS.listen('.module-journal', 'click', (e) => {
            
        });
        TMJS.listen('.module-printers', 'click', (e) => {
            
        });
    }
}

export { TMView, ViewNotepad, ViewControl };