import { Component } from 'react';
import { Button } from 'react-bootstrap';
import styles from './GlobalPerms.module.css';

interface GlobalPermsProps {
    isGlobal: boolean;
    isAdmin: boolean;
    togglePublic: () => void;
}

export default class GlobalPerms extends Component<GlobalPermsProps> {
    renderGlobalStatusMessage() {
        if (this.props.isGlobal) {
            return (
                <span>
                    This Narrative is
                    <span className={styles['status-public']}>
                        <span className="fa fa-unlock"></span> Public
                    </span>
                </span>
            );
        } else {
            return (
                <span>
                    This Narrative is
                    <span className={styles['status-private']}>
                        <span className="fa fa-lock"></span> Private
                    </span>
                </span>
            );
        }
    }

    renderButtonHelp() {
        if (!this.props.isAdmin) {
            return null;
        }
        if (this.props.isGlobal) {
            return '(click to make private)';
        } else {
            return '(click to make public)';
        }
    }

    renderBackgroundColor() {
        if (this.props.isGlobal) {
            return 'bg-light-green dark-green b--green';
        } else {
            return 'bg-lightest-blue dark-blue b--dark-blue';
        }
    }

    renderButton() {
        if (!this.props.isAdmin) {
            return <span>Cannot change</span>;
        }
        return (
            <Button onClick={this.props.togglePublic}>
                {this.props.isGlobal ? 'Make it Private' : 'Make it Public'}
            </Button>
        );
    }

    render() {
        return (
            <div className={`${styles.GlobalPerms}`}>
                {this.renderGlobalStatusMessage()}
                {this.renderButton()}
            </div>
        );
    }
}
