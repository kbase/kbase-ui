import { Component } from 'react';
import { Config } from '../../../types/config';
import { BuildInfo, GitInfo } from '../../../types/info';

export interface AboutKBaseUIProps {
    config: Config;
    gitInfo: GitInfo;
    buildInfo: BuildInfo;
}

interface AboutKBaseUIState { }

export default class AboutKBaseUI extends Component<
    AboutKBaseUIProps,
    AboutKBaseUIState
> {
    renderHub() {
        return (
            <span style={{ whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 'bold' }}>KBase UI</span>
            </span>
        );
    }

    renderWelcome() {
        // const docSiteUrl = this.props.config.ui.urls.
        return (
            <div>
                <p>
                    You are currently using the KBase User Interface (UI), a
                    collection of tools for KBase Users and Developers.
                </p>
                <p>
                    The UI is one of three primary web-based tools which
                    comprise KBase:
                </p>
                <ul>
                    <li>
                        The{' '}
                        <a
                            href="/#narrativemanager/start"
                            target="_blank"
                            style={{ fontWeight: 'bold' }}
                        >
                            Narrative Interface
                        </a>
                        , a tool for creating, editing, running and publishing
                        active scientific documents called Narratives. New to
                        the Narrative? Perhaps you would like to check out the{' '}
                        <a
                            href={this.props.config.ui.urls.narrativeGuide.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontWeight: 'bold' }}
                        >
                            Narrative Interface User Guide
                        </a>
                        .
                    </li>
                    <li>
                        The{' '}
                        <a
                            href={this.props.config.ui.urls.documentation.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontWeight: 'bold' }}
                        >
                            Documentation Site
                        </a>
                        , which provides tutorials and developer documentation,
                        communications and publications, links to social media
                        outlets, developer documentation, and background on
                        KBase.
                    </li>
                    <li>
                        The UI, which provides login, account management,
                        dashboard, catalog, data object viewing, and search
                        services.
                    </li>
                </ul>
            </div>
        );
    }

    renderGitInfo(): [JSX.Element, string, string] {
        const gitInfo = this.props.gitInfo;

        let repoUrl = gitInfo.originURL; // 'https://github.com/kbase/kbase-ui';
        const hash = gitInfo.hash.full;
        if (/^ssh:/.test(repoUrl)) {
            const m = /^ssh:\/\/git@(.*?)\/(.*?)$/.exec(repoUrl);
            if (m) {
                repoUrl = 'https://' + m[1] + '/' + m[2];
            }
        }

        const commitHash = gitInfo.hash.full

        let relNotesUrl;
        let githubUrl;
        if (gitInfo.tag) {
            relNotesUrl = [
                repoUrl,
                'blob',
                hash,
                'release-notes',
                'RELEASE_NOTES_' + gitInfo.version + '.md',
            ].join('/');
            githubUrl = [repoUrl, 'tree', gitInfo.tag].join('/');

            return [
                <p>
                    You are currently using version{' '}
                    <a
                        href={relNotesUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontWeight: 'bold' }}
                    >
                        {gitInfo.version}
                    </a>{' '}
                    of {this.renderHub()}.
                </p>,
                githubUrl,
                relNotesUrl,
            ];
        } else {
            relNotesUrl = [
                repoUrl,
                'blob',
                hash,
                'release-notes',
                'index.md',
            ].join('/');
            githubUrl = [repoUrl, 'tree', hash].join('/');
            return [
                <p>
                    This build is not located at a tagged commit. The current
                    commit is{' '}
                    <a
                        href={[repoUrl, 'commit', hash].join('/')}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {commitHash}
                    </a>
                    .
                </p>,
                githubUrl,
                relNotesUrl,
            ];
        }
    }


    renderVersionInfo() {
        const buildInfo = this.props.buildInfo;

        const buildDate = new Date(buildInfo.builtAt);

        const buildDateString = Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(buildDate);

        const buildTimeString = Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
        }).format(buildDate);

        const contactUrl = this.props.config.ui.urls.contact.url;

        const aboutKBase = this.props.config.ui.urls.aboutKBase.url;

        const uiDocumentationUrl =
            'http://kbaseincubator.github.io/kbase-ui-docs';
        const documentationURL = this.props.config.ui.urls.documentation.url;

        const [githubContent, githubUrl,relNotesUrl]  = this.renderGitInfo();

        const kbaseGithubOrgURL = 'https://github.com/kbase';

        return (
            <div>
                {githubContent}
                <p>
                    It was built on {buildDateString} at {buildTimeString}.
                </p>
                <h3>You may also be interested in:</h3>
                <ul>
                    <li>
                        {' '}
                        KBase
                        <ul>
                            <li>
                                <a
                                    href={aboutKBase}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    About KBase
                                </a>
                            </li>
                            <li>
                                <a
                                    href={contactUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Support
                                </a>
                            </li>
                            <li>
                                <a
                                    href={documentationURL}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href={kbaseGithubOrgURL}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    KBase Github Organization
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        {' '}
                        KBase UI (this web app)
                        <ul>
                            <li>
                                <a
                                    href={uiDocumentationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    KBase UI Github Repo
                                </a>
                            </li>
                            <li>
                                <a
                                    href={relNotesUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Release Notes
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }

    render() {
        return (
            <div
                className="container-fluid View"
                data-k-b-testhook-plugin="about"
            >
                <div className="row">
                    <div className="col-sm-6" data-k-b-testhook-panel="welcome">
                        <h2>The KBase User Interface</h2>
                        {this.renderWelcome()}
                    </div>
                    <div
                        className="col-sm-6"
                        data-k-b-testhook-panel="build-info"
                    >
                        <h2>This Version</h2>
                        {this.renderVersionInfo()}
                    </div>
                </div>
            </div>
        );
    }
}
