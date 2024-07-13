import { TMJS } from './tmjs';
import { TMStorage } from './tmstorage';
import { TMExecute } from './tmexecute';

class TMView {
    static hideViews() {
        // TMJS.select( 'view', (e) => {
        //     e.classList.add( 'view-inactive' );
        // });
        TMJS.select( 'view', (e) => {
            e.style.display = "none";
        });
    }

    static setView( view ) {
        this.hideViews();

        // document.querySelector( 'view[data-view="' + view + '"]' ).classList.remove( 'view-inactive' );
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
        TMView.setView( 'control' );

        TMJS.listen( '.xr-menu-button', 'click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            TMView.setView( view );
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
    static init() {
        
        TMJS.selectOne('control-loader', (element) => {
            TMJS.animateShow(element, 0.95);
        });

        TMJS.hide('control-loader .xr-loading');
        TMJS.show('control-loader .xr-label');

        TMJS.html('control-loader .xr-label', "Введите значение хоста");

        this.setInputEvent();
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

        const output = await TMExecute.module("ping.exe", this.getHostValue());
        
        TMJS.deleteAttribute('.control-host', 'disabled');
        TMJS.deleteAttribute('.control-refresh', 'disabled');

        if( output.stdout.toLowerCase() === "true" ) this.hideLoader();
        else {
            TMJS.hide('control-loader .xr-loading');
            TMJS.show('control-loader .xr-label');

            TMJS.selectOne('control-loader', (element) => {
                TMJS.animateShow(element, 0.95);
            });
        }
    }
}

export { TMView, ViewNotepad, ViewControl };