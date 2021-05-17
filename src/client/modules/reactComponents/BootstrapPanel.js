define([
    'preact',
    'htm',

    // for effect
    'bootstrap',
], (
    preact,
    htm,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class BootstrapPanel extends Component {
        constructor(props) {
            super(props);
        }

        renderIcon(icon) {
            const classes = ['fa'];
            const style = {verticalAlign: 'middle'};
            classes.push('fa-' + icon.name);
            if (icon.rotate) {
                classes.push('fa-rotate-' + String(icon.rotate));
            }
            if (icon.flip) {
                classes.push('fa-flip-' + icon.flip);
            }
            if (icon.size) {
                if (typeof icon.size === 'number') {
                    classes.push('fa-' + String(icon.size) + 'x');
                } else {
                    classes.push('fa-' + icon.size);
                }
            }
            if (icon.classes) {
                icon.classes.forEach(function (klass) {
                    classes.push(klass);
                });
            }
            if (icon.style) {
                Object.keys(icon.style).forEach(function (key) {
                    style[key] = icon.style[key];
                });
            }
            if (icon.color) {
                style.color = icon.color;
            }


            return html`
                <span data-element="icon"
                      style=${style}
                      className=${classes.join(' ')}></span>
            `;
        }

        render() {
            const type = this.props.type || 'primary';
            let classes = ['panel', 'panel-' + type];
            let icon;
            if (this.props.hidden) {
                classes.push('hidden');
            }
            if (this.props.classes) {
                classes = classes.concat(this.props.classes);
            }
            if (this.props.class) {
                classes.push(this.props.class);
            }
            if (this.props.icon) {
                icon = [' ', this.renderIcon(this.props.icon)];
            }
            const panelAttributes = {
                class: classes.join(' '),
                dataElement: this.props.name,
                id: this.props.id,
            };
            if (this.props.attributes) {
                Object.keys(this.props.attributes).forEach(function (key) {
                    if (key in panelAttributes) {
                        throw new Error('Key already defined in attributes: ' + key);
                    }
                    panelAttributes[key] = this.props.attributes[key];
                });
            }
            let heading;
            if (this.props.title) {
                heading = html`
                    <div className="panel-heading">
                        <div className="panel-title"
                             data-element="title">
                            ${this.props.title}
                            ${icon}
                        </div>
                    </div>
                `;
            }
            return html`
                <div ...${panelAttributes}>
                    ${heading}
                    <div className="panel-body"
                         data-element="body">
                        ${this.props.body || this.props.children}
                    </div>
                </div>
            `;
        }
    }

    return BootstrapPanel;
});