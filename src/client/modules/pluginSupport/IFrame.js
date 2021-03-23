define([
    'preact',
    'htm',
    'uuid',

    'css!./IFrame.css'
], (
    preact,
    htm,
    {v4: uuidv4}
) => {

    const {h, Component, createRef} = preact;
    const html = htm.bind(h);

    class IFrame extends Component {
        constructor(props) {
            super(props);

            // const {
            //     origin, pathRoot, channelId, hostId,
            //     params, runtime
            // } = props;

            const id = uuidv4();
            this.id = `frame_ ${id}`;

            this.ref = createRef();

            const indexPath = this.props.pathRoot + '/iframe_root/index.html';

            // Make an absolute url to this.
            this.url = this.props.origin + '/' + indexPath + this.cacheBuster();

        }

        cacheBusterKey(buildInfo, developMode) {
            // NB developMode not implemented yet, so always defaults
            // to the gitCommitHash
            if (developMode) {
                return String(new Date().getTime());
            } else {
                return buildInfo.git.commitHash;
            }
        }

        cacheBuster() {
            // TODO: get develop mode from runtime
            return '?cb=' + this.cacheBusterKey(this.props.runtime.config('buildInfo'), false);
        }

        componentDidMount() {
            if (this.ref.current === null) {
                return;
            }
            this.props.whenMounted(this.ref.current.contentWindow);
        }

        render() {
            const params = {
                frameId: this.id,
                parentHost: document.location.origin,
                buildInfo: this.props.runtime.config('buildInfo'),
                developMode: false,
                params: this.props.params,
                channelId: this.props.channelId
            };

            const paramString = window.encodeURIComponent(JSON.stringify(params));

            return html`
            <iframe id=${this.id}
                    name=${this.id}
                    data-k-b-testhook-iframe="plugin-iframe"
                    data-params=${paramString}
                    data-channel-id=${this.props.channelId}
                    className="IFrame -iframe"
                    frameborder="0"
                    scrolling="no"
                    ref=${this.ref}
                    src=${this.url}></iframe>
            `;
        }
    }

    return IFrame;
});