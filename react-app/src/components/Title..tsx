import { Component } from 'react';
import './Title.css';

export interface TitleProps {
    title: string;
}

interface TitleState {}

export default class Title extends Component<TitleProps, TitleState> {
    constructor(props: TitleProps) {
        super(props);
        this.state = {
            title: this.props.title,
        };
    }

    render() {
        // Note that this allows html to be set in the title. This allows plugins to set
        // html.
        return (
            <div className="Title" data-k-b-testhook-component="title">
                {this.props.title}
            </div>
        );
    }
}
