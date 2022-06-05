import {Component, Fragment} from 'react';
import { HashPath } from '../../contexts/RouterContext';
import {Config} from '../../types/config';
import HelpLinks from '../HelpLinks';
import flapjack from './flapjack.png';
import './NotFound.css'

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

    renderNotFound() {
        return (
            <div className="NotFound" >
                <div className="NotFound-graphic">
                    <img src={flapjack} alt="The Flapjack"/>
                </div>
                <div className="NotFound-content">
                    <div className="NotFound-header" style={{flex: '1 1 0px'}}>
                        <p>
                            Not Found
                        </p>
                    </div>
                    <div className="NotFound-message"style={{flex: '1 1 0px'}}>
                        <p>
                            Sorry, this resource, <em>"{this.props.hashPath.hash}"</em> was not found.
                        </p>
                        
                    </div>
                    <div className="NotFound-body">
                        <HelpLinks />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return <div style={{margin: '0 10px'}}>{this.renderNotFound()}</div>;
    }
}
