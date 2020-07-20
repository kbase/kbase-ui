define([
    'preact',
    'htm',

    'bootstrap'
], (
    preact,
    htm
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class NotFound extends Component {
        render() {
            this.props.runtime.send('ui', 'setTitle', 'Not Found!');
            return html`
                <div className="well" style=${{margin: '0 10px'}}>
                    <div className="text-danger"  style=${{fontSize: '140%'}}>
                        <strong><span className="fa fa-meh-o"></span>${' '}Path Not Found</strong>
                    </div>
                    <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                        Sorry, the path "${this.props.params.request.original}" does not lead anywhere.
                    </p>
                </div>
            `;
        }
    }

    return NotFound;
});