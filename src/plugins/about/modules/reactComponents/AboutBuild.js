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

    class AboutBuild extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'About the kbase-ui build');
        }
        renderCommit(gitInfo) {
            return html`
                <table className="table">
                   <tbody>
                       <tr>
                           <th>hash</th>
                           <td>${gitInfo.commitHash}</td>
                       </tr>
                       <tr>
                           <th>shortHash</th>
                           <td>${gitInfo.commitAbbreviatedHash}</td>
                       </tr>
                       <tr>
                           <th>message</th>
                           <td>${gitInfo.subject}</td>
                       </tr>
                       <tr>
                           <th>by</th>
                           <td>${gitInfo.committerName}</td>
                       </tr>
                       <tr>
                           <th>date</th>
                           <td>${new Date(gitInfo.comitterDate).toLocaleString()}</td>
                       </tr>                       
                   </tbody>
               </table>
           `;
        }

        renderAuthor(gitInfo) {
            return html`
                <table className="table">
                   <tbody>
                       <tr>
                           <th>author</th>
                           <td>${gitInfo.authorName}</td>
                       </tr>
                       <tr>
                           <th>authorDate</th>
                           <td>${new Date(gitInfo.authorDate).toLocaleString()}</td>
                       </tr>
                    </tbody>
               </table>
           `;
        }

        renderGit(gitInfo) {
            return html`
                <table className="table">
                    <tbody>
                        <tr>
                            <th>branch</th>
                            <td>${gitInfo.branch}</td>
                        </tr>
                        <tr>
                            <th>url</th>
                            <td>${gitInfo.url}</td>
                        </tr>
                        <tr>
                            <th>commit</th>
                            <td>${this.renderCommit(gitInfo)}</td>
                        </tr>
                        <tr>
                            <th>author</th>
                            <td>${this.renderAuthor(gitInfo)}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        renderDummy() {
            return html`
                <div>dummy</div>
            `;
        }

        renderBuildInfo() {
            // return this.renderDummy();
            const buildInfo = this.props.buildInfo;
            return html`
                <table className="table">
                    <tbody>
                        <tr>
                            <th>builtAt</th>
                            <td> ${new Date(buildInfo.builtAt).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <th>git</th>
                            <td>${this.renderGit(buildInfo.git)}</td>
                        </tr>
                    </tbody>
                </table>
            `;

        }

        render() {
            return html`
            <div  className="AboutBuild">
                <div data-k-b-testhook-panel="build">
                    <h2>
                        Build
                    </h2>
                    ${this.renderBuildInfo()}
                </div>
                
                <div data-k-b-testhook-panel="dependencies">
                    <h2>
                        Dependencies
                    </h2>
                    ...not yet...
                </div>
            </div>
            `;
        }
    }

    return AboutBuild;
});