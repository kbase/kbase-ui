import Empty from "components/Empty";
import Well from "components/Well";
import { notifySuccess } from "contexts/EuropaContext";
import { TokenInfoFull } from "lib/kb_lib/Auth2";
import { niceDuration, niceTime } from "lib/time";
import { Component } from "react";
import { Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import AddTokenForm from '../AddTokenForm';
import TokenCopy from "../TokenCopy";
import styles from './view.module.css';

const TOKEN_VIEWER_EXPIRES_IN = 300000;

export interface ServTokensViewProps {
    tokens: Array<TokenInfoFull>;
    newToken: TokenInfoFull | null;
    serverTimeBias: number;
    revokeToken: (token: string, name: string) => void;
    revokeAllTokens: () => void;
    createServiceToken: (name: string) => void;
    clearNewToken: () => void;
}

interface ServTokensViewState {
}

export default class ServTokensView extends Component<ServTokensViewProps, ServTokensViewState> {
    doRevokeToken(tokenId: string, name: string) {
        this.props.revokeToken(tokenId, name);
    }

    doRevokeAllTokens() {
        this.props.revokeAllTokens();
    }

    renderTokenBrowser(tokens: Array<TokenInfoFull>, removeVerb: string) {
        const revokeAllButton = (() => {
            if (tokens.length > 1) {
                return <button type="button"
                    className="btn btn-danger"
                    onClick={this.doRevokeAllTokens.bind(this)}
                >{removeVerb} All</button>
            }
        })();
        const rows = tokens.map(({ name, id, created, expires, os, osver, agent, agentver, ip }) => {
            const renderBrowser = () => {
                if (agent === null) { // } || agent.agent === 0) {  // TODO: what is this actual type???
                    return <span style={{
                        fontStyle: 'italic',
                        marginLeft: '0.2em',
                        color: '#888'
                    }}>
                        n/a
                    </span>
                }
                return <span>
                    {agent}
                    <span style={{
                        fontStyle: 'italic',
                        marginLeft: '0.2em',
                        color: '#888'
                    }}>
                        {agentver}
                    </span>
                </span>
            };
            const renderOS = () => {
                if (os === null) { // } || os.agent === 0) { // TODO: is that supposed to be "length"?
                    return <span style={{
                        fontStyle: 'italic',
                        marginLeft: '0.2em',
                        color: '#888'
                    }}>
                        n/a
                    </span>
                }
                return <span>
                    {os}
                    <span style={{
                        fontStyle: 'italic',
                        marginLeft: '0.2em',
                        color: '#888'
                    }}>
                        {osver}
                    </span>
                </span>
            };

            return <tr key={id}>
                <td>
                    {name}
                </td>
                <td>
                    {niceTime(new Date(created))}
                </td>
                <td>
                    {niceDuration(expires - (Date.now() - this.props.serverTimeBias))}
                </td>
                <td>
                    {renderBrowser()}
                </td>
                <td>
                    {renderOS()}
                </td>
                <td>
                    {ip}
                </td>
                <td>
                    <Button variant="danger"
                        type="button"
                        onClick={() => { this.doRevokeToken(id, name || 'un-named'); }}>
                        {removeVerb}
                    </Button>
                </td>
            </tr>
        });
        return <table className="table table-striped -allTokensTable"
            style={{ width: '100%' }}>
            <thead>
                <tr>
                    <th>
                        Name
                    </th>
                    <th>
                        Created
                    </th>
                    <th>
                        Expires
                    </th>
                    <th>
                        Browser
                    </th>
                    <th>
                        Operating System
                    </th>
                    <th>
                        IP Address
                    </th>
                    <th>
                        {revokeAllButton}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    }

    renderServTokens() {
        if (this.props.tokens.length > 0) {
            return this.renderTokenBrowser(this.props.tokens, 'Remove');
        }
        return <Empty message="You do not have any Service Tokens." style={{ maxWidth: '40rem', alignSelf: 'center' }} />
    }

    renderRemoveAll() {
        return <ButtonToolbar className="mt-2 mb-2">
            <ButtonGroup role="group">
                <Button variant="danger"
                    disabled={this.props.tokens.length === 0}
                    onClick={this.doRevokeAllTokens.bind(this)}
                    // data-toggle="tooltip"
                    // data-placement="left"
                    title="Remove all of your sign-in sessions, including the current one, and log out of KBase">
                    Remove All Service Tokens
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    }

    renderTokens() {
        return <Well variant="secondary">
            <Well.Header>
                Service Tokens
            </Well.Header>
            <Well.Body>
                {this.renderServTokens()}
            </Well.Body>
            <Well.Footer>
                {this.renderRemoveAll()}
            </Well.Footer>
        </Well>
    }

    renderHelp() {
        return <div>
            <p>
                a <em>sign-in session</em> is created when you
                sign in to KBase. A sign-in session is removed when you logout.
                However, if you do not logout, your sign-in session will remain active for two weeks.
                At the end of two weeks, the sign-in session will become invalid, and you will need to sign-in again.
            </p>
        </div>
    }

    renderNewToken() {
        if (!this.props.newToken) {
            return;
        }

        const onCopied = () => {
            notifySuccess('Token copied to clipboard', 3000);
        };

        const onCopyError = (message: string) => {
            console.log('message', message)
            // this.props.runtime.notifyError(
            //     `Error copying token to clipboard: ${message}`
            // );
        };

        const onDone = () => {
            this.props.clearNewToken();

            // this.props.runtime.send('notification', 'notify', {
            //     type: 'warning',
            //     id: 'devtoken',
            //     icon: 'ban',
            //     message: 'The Developer Token session has been canceled',
            //     description: 'The Developer Token session has been canceled',
            //     autodismiss: 10000
            // });
        };

        return <TokenCopy 
            newToken={this.props.newToken}
            onCopied={onCopied}
            onCopyError={onCopyError}
            onDone={onDone}
            expiresIn={TOKEN_VIEWER_EXPIRES_IN}
        />
    }

    renderNewTokenForm() {
        return <Well variant="secondary" className="mb-4">
            <Well.Header>
                Create Service Token
            </Well.Header>
            <Well.Body>
                <AddTokenForm createToken={this.props.createServiceToken}  />
                {this.renderNewToken()}
            </Well.Body>
        </Well>
    }

    render() {
        return <div className={styles.main}>
            {this.renderNewTokenForm()}
            {this.renderTokens()}
        </div>
    }
}