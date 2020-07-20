define([
    'preact',
    'htm',

    'bootstrap',
    'css!./style.css'
], (
    preact,
    htm
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class About extends Component {

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'About');
        }

        renderHub() {
            return html`
                <span style=${{whiteSpace: 'nowrap'}}>
                    <span style=${{fontWeight: 'bold'}}>
                        KBase UI
                    </span>
                </span>
            `;
        }

        renderWelcome() {
            const narrativeUrl = this.props.runtime.config('services.narrative.url');
            const docSiteUrl = this.props.runtime.config('resources.docSite.base.url');
            return html`
            <div>
                <p>
                You are currently using the KBase User Interface (UI), 
                a collection of tools for KBase Users and Developers.
                </p>
                <p>
                The UI is one of three primary web-based tools which 
                comprise KBase:
                </p>
                <ul>
                    <li>
                        The ${' '}
                        <a href=${narrativeUrl} target="_blank"
                           style=${{fontWeight: 'bold'}}>
                           Narrative Interface
                        </a>,
                        a tool for creating, editing, running and publishing active 
                        scientific documents called Narratives. New to the Narrative? 
                        Perhaps you would like to check out the ${' '}
                        <a href="http://kbase.us/narrative-guide"
                           target="_blank"
                           style=${{fontWeight: 'bold'}}>
                           Narrative Interface User Guide
                        </a>.
                    </li>
                    <li>
                        The ${' '}
                        <a href=${docSiteUrl}
                           target="_blank"
                           style=${{fontWeight: 'bold'}}>
                           Documentation Site
                        </a>, which provides tutorials and developer documentation, 
                        communications and publications, links to social media outlets, 
                        developer documentation, and background on KBase.
                    </li>
                    <li>
                        The UI, which provides login, account management, dashboard, 
                        catalog, data object viewing, and search services.
                    </li>
                </ul>
            </div>
            `;
        }

        renderGitInfo() {
            const buildInfo = this.props.runtime.config('buildInfo');

            let repoUrl = buildInfo.git.originUrl; // 'https://github.com/kbase/kbase-ui';
            const hash = buildInfo.git.commitHash;
            // https://github.com/eapearson/kbase-ui/blob/bf5efa0810d9f097b7c6ba8390f97c008d98d80e/release-notes/RELEASE_NOTES_1.5.0.md
            if (/^ssh:/.test(repoUrl)) {
                var m = /^ssh:\/\/git@(.*?)\/(.*?)$/.exec(repoUrl);
                repoUrl = 'https://' + m[1] + '/' + m[2];
            }

            const commitHash = buildInfo.git.commitHash;

            let relNotesUrl;
            let githubUrl;
            if (buildInfo.git.tag) {
                relNotesUrl = [
                    repoUrl,
                    'blob',
                    hash,
                    'release-notes',
                    'RELEASE_NOTES_' + buildInfo.git.version + '.md'
                ].join('/');
                githubUrl = [repoUrl, 'tree', buildInfo.git.tag].join('/');

                return [html`
                    <p>You are currently using version ${' '}
                    <a href=${relNotesUrl}
                       target="_blank"
                       style=${{fontWeight: 'bold'}}>
                       ${buildInfo.git.version}
                    </a> of ${' '}${this.renderHub()}.
                    </p>
                `, githubUrl, relNotesUrl];
            } else {
                relNotesUrl = [repoUrl, 'blob', hash, 'release-notes', 'index.md'].join('/');
                githubUrl = [repoUrl, 'tree', hash].join('/');
                return [html`
                    <p>This build is not located at a tagged commit. 
                    The current commit is ${' '}
                    <a href=${[repoUrl, 'commit', hash].join('/')}>
                    ${commitHash}
                    </a>.</p>
                `, githubUrl, relNotesUrl];
            }
        }

        renderVersionInfo() {
            const buildInfo = this.props.runtime.config('buildInfo');
            const buildDate = Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date(buildInfo.builtAt));
            const buildTime = Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short'
            }).format(new Date(buildInfo.builtAt));
            // const builtAt = moment(new Date(buildInfo.builtAt));
            // const buildDate = builtAt.format('dddd MMMM D, YYYY');
            // const buildTime = builtAt.format('h:mm:ss a');
            const contactUrl = this.props.runtime.config('resources.contact.url');
            const helpUrl = this.props.runtime.config('resources.help.url');
            const aboutKbase = this.props.runtime.config('resources.documentation.aboutKbase.url');

            const documentationUrl = 'http://kbaseincubator.github.io/kbase-ui-docs';

            const [githubContent, githubUrl, relNotesUrl] = this.renderGitInfo();

            return html`
            <div>
                ${githubContent}
                <p>It was built on ${buildDate} at ${buildTime}.</p>
                <h3>You may also be interested in:</h3>
                <ul>
                    <li>
                        <a href=${aboutKbase} target="_blank">
                            About KBase
                        </a>
                    </li>
                    <li>
                        <a href=${contactUrl} target="_blank">
                            Contact KBase
                        </a>
                    </li>
                    <li>
                        <a href=${documentationUrl} target="_blank">
                            Documentation
                        </a>
                    </li>
                    <li>
                        <a href=${githubUrl} target="_blank">
                            Github Repo
                        </a>
                    </li>
                    <li>
                        <a href=${helpUrl} target="_blank">
                            Public Help Board
                        </a>
                    </li>
                    <li>
                        <a href=${relNotesUrl} target="_blank">
                            Release Notes
                        </a>
                    </li>
                </ul>
            </div>`;

        }

        render() {
            return html`
                <div className="container-fluid View"
                     data-k-b-testhook-plugin="about">
                    <div className="row">
                        <div className="col-sm-6"
                             data-k-b-testhook-panel="welcome">
                            <h2>
                                The KBase User Interface
                            </h2>
                            ${this.renderWelcome()}
                        </div>
                        <div className="col-sm-6"
                             data-k-b-testhook-panel="build-info">
                            <h2>
                                This Version
                            </h2>
                            ${this.renderVersionInfo()}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    return About;
});