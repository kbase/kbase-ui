import { Component } from 'react';
import { Form } from 'react-bootstrap';
import { AuthenticationState } from '../../contexts/EuropaContext';
import { Config } from '../../types/config';
import Body from '../Body';
import Notifications from '../ToastNotifications';
import styles from './style.module.css';

export interface MainWindowProps {
    authState: AuthenticationState;
    config: Config;
    hideUI?: boolean;
    isHosted: boolean;
    setTitle: (title: string) => void;
}

export default class MainWindow extends Component<MainWindowProps> {
    renderMenuSearch() {
        return <div className={styles.menuSearch}>
            <div className={styles.menuSearchSearchbar}>
                <Form.Control type="text" />
            </div>
            <div className={styles.menuSearchSearchresults}></div>
        </div>
    }

    render() {
        return (
            <div className={styles.main} data-k-b-testhook-component="mainwindow">
               <Notifications />
                {/* {this.renderMenuSearch()} */}
                <div className={styles.body}>
                    <div className={styles.contentArea}>
                        <div className={styles.content}>
                            <Body
                                {...this.props}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
