import {Component} from 'react';
import { HashPath } from '../../contexts/RouterContext';
import HelpLinks from '../HelpLinks';
import flapjack from './flapjack.png';
import styles from './NotFound.module.css'

export interface NotFoundProps {
    hashPath: HashPath;
    // params: URLSearchParams;
    setTitle: (title: string) => void;
}

interface NotFoundState {
}

export default class NotFound extends Component<NotFoundProps, NotFoundState> {
    componentDidMount() {
        this.props.setTitle(`Not Found - ${this.props.hashPath.hash}`);
    }

    render() {
        return (
            <div className={styles.main} >
                <div className={styles.graphic}>
                    <img src={flapjack} alt="The Flapjack"/>
                </div>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <p>
                            Not Found
                        </p>
                    </div>
                    <div className={styles.message}>
                        <p>
                            Sorry, this resource, <em>"{this.props.hashPath.hash}"</em> was not found.
                        </p>
                        
                    </div>
                    <div className={styles.body}>
                        <HelpLinks />
                    </div>
                </div>
            </div>
        );
    }
}
