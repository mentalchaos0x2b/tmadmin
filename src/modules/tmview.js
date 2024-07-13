import { TMJS } from './tmjs';

class TMView {
    static hideViews() {
        TMJS.select( 'view', (e) => {
            e.classList.add( 'view-inactive' );
        });
    }

    static setView( view ) {
        this.hideViews();

        document.querySelector( 'view[data-view="' + view + '"]' ).classList.remove( 'view-inactive' );

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

export { TMView }