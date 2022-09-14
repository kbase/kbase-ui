import { Publication } from "apps/ORCIDLink/Model";
import { Component } from "react";
import { Button } from "react-bootstrap";
import PublicationView from "./PublicationView";
import { HEADER_STYLE, SECTION_BODY_STYLE } from "./styles";
import styles from './ViewPublication.module.css';

export interface ViewPublicationProps {
    publication: Publication;
    onCancel: () => void;
}

interface ViewPublicationState {

}

export default class ViewPublication extends Component<ViewPublicationProps, ViewPublicationState> {
    render() {
        return <div className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">

                <div className="flex-row" style={HEADER_STYLE}>
                    View Publication
                </div>

                <div className="flex-row">
                    <PublicationView publication={this.props.publication} />
                </div>

                <div className="flex-row" style={SECTION_BODY_STYLE}>
                    <div className="btn-group">
                        <Button variant="outline-danger" onClick={this.props.onCancel}>
                            <span className="fa fa-times-circle" /> Close
                        </Button>
                    </div>
                </div>
            </div>
        </div >;
    }
}