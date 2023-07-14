import { Component } from 'react';
import styles from './Main.module.css';

export interface MainProps {
    setTitle: (title: string) => void;
}

interface MainState {}

export default class Main extends Component<MainProps, MainState> {
    componentDidMount() {
        this.props.setTitle('Developer Tools - Main');
    }

    render() {
        return (
            <div className={styles.Main}>
                <p>Welcome to the Developer Tools.</p>
                <p>
                    Currently this tool just lets you edit the runtime config.
                </p>
            </div>
        );
    }
}
