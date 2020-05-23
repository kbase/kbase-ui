define([
    './widget'
], (
    Widget
) => {
    'use strict';

    class WidgetFlexContainer extends Widget {
        createContainer(node) {
            if (this.container) {
                // throw new Error('Container already created already set for this widget');
                return;
            }
            this.mount = node;
            this.container = document.createElement('div');
            this.container.style.display = 'flex';
            this.container.style.flex = '1 1 0px';
            this.container.style['flex-direction'] = 'column';
            this.container.style['overflow-y'] = 'auto';
            this.container.setAttribute('data-widget-type', 'flex-container');
            this.mount.appendChild(this.container);
        }
    }

    return WidgetFlexContainer;
});