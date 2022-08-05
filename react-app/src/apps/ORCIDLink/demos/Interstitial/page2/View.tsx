import { Component } from 'react';
import styles from './View.module.css';

export interface ViewProps {
    isLinked: boolean;
}

interface ViewState {

}

export default class View extends Component<ViewProps, ViewState> {
    renderLinked() {
        return <div className={styles.main}>
            Already linked!
        </div>
    }

    renderNotYetLinked() {
        return <div className={styles.main}>
            <h2>Using linking as an insterstitial page</h2>
            <p>
                <a href="/#orcidlink">Back</a>
            </p>
            <p>
                Linking page
            </p>
        </div>
    }


    render() {
        if (this.props.isLinked) {
            return this.renderLinked();
        }
        return this.renderNotYetLinked();
    }
}