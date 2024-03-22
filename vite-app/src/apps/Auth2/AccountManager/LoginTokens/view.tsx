import Empty from "components/Empty";
import Well from "components/Well";
import { TokenInfoFull } from "lib/kb_lib/Auth2";
import { niceDuration, niceTime } from "lib/time";
import { Component } from "react";
import { Button, ButtonGroup, ButtonToolbar, Table } from "react-bootstrap";
import styles from './view.module.css';

export interface LoginTokensViewProps {
    tokens: Array<TokenInfoFull>;
    currentToken: TokenInfoFull;
    serverTimeBias: number;
    revokeCurrentTokenAndLogout: () => void;
    revokeAllTokensAndLogout: () => void;
    revokeToken: (token: string) => void;
    revokeAllTokens: () => void;
}

interface LoginTokensViewState {
}

export default class LoginTokensView extends Component<LoginTokensViewProps, LoginTokensViewState> {
    doRevokeToken(tokenId: string) {
        if (tokenId === this.props.currentToken.id) {
            this.props.revokeCurrentTokenAndLogout();
        } else {
            this.props.revokeToken(tokenId);
        }
    }

    doRevokeAllTokens() {
        this.props.revokeAllTokens();
    }

    doRevokeAllTokensAndLogout() {
        this.props.revokeAllTokensAndLogout();
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
        const rows = tokens.map(({ id, created, expires, os, osver, agent, agentver, ip }) => {
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
                        onClick={() => { this.doRevokeToken(id); }}>
                        {removeVerb}
                    </Button>
                </td>
            </tr>
        });
        return <Table striped className="-allTokensTable"
            style={{ width: '100%' }}>
            <thead>
                <tr>
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
        </Table>
    }

    renderCurrentToken() {
        return this.renderTokenBrowser([this.props.currentToken], 'Logout');
    }

    renderOtherTokens() {
        if (this.props.tokens.length > 0) {
            return this.renderTokenBrowser(this.props.tokens, 'Remove');
        }
        return <Empty>
             You do not have any additional active sign-in sessions.
        </Empty>
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
                    Remove All Other Sessions
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    }

    renderRemoveAllAndLogout() {
        return <ButtonToolbar className="mt-2 mb-2">
            <ButtonGroup role="group">
                <Button variant="danger"
                    disabled={this.props.tokens.length === 0}
                    onClick={this.doRevokeAllTokensAndLogout.bind(this)}
                    // data-toggle="tooltip"
                    // data-placement="left"
                    title="Remove all of your sign-in sessions, including the current one, and log out of KBase">
                    Remove All and Logout
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    }

    renderCurrentSession() {
        return <Well variant="secondary" className="mb-4">
            <Well.Header>
                Your Current Login Session
            </Well.Header>
            <Well.Body>
                {this.renderCurrentToken()}
            </Well.Body>
        </Well>
    }

    renderOtherSessions() {
        return <Well variant="secondary">
            <Well.Header>
                Other Login Sessions
            </Well.Header>
            <Well.Body>
                {this.renderOtherTokens()}
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

    render() {
        return <div className={styles.main}>
             {this.renderRemoveAllAndLogout()}
            {this.renderCurrentSession()}
            {this.renderOtherSessions()}
        </div>
    }
}
