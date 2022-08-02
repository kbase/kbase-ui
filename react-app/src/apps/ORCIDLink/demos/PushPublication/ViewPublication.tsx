import { ExternalId, Publication } from "apps/ORCIDLink/Model";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import styles from './ViewPublication.module.css';

export interface ViewPublicationProps {
    publication: Publication;
    onCancel: () => void;
}

interface ViewPublicationState {

}


export default class ViewPublication extends Component<ViewPublicationProps, ViewPublicationState> {

    constructor(props: ViewPublicationProps) {
        super(props);
        const { publicationType, title, date, journal, url, citationType, externalIds } = props.publication;
        this.state = {
            editState: {
                publicationType, title, date, journal: journal || '', url: url || '',
                citationType: citationType || '',
                externalIds: externalIds || []
            }
        }
    }


    renderExternalIds() {
        const rows = this.props.publication.externalIds.map(({ type, url, value }, index) => {
            return <div className="flex-row ">
                <div className="flex-col">
                    {type}
                </div>
                <div className="flex-col">
                    {value}
                </div>
                <div className="flex-col">
                    <a href={url} target="_blank">{url}</a>
                </div>
            </div>
        });
        return <div className="flex-table">
            <div className="flex-row -header">
                <div className="flex-col">
                    Type
                </div>
                <div className="flex-col">
                    Value
                </div>
                <div className="flex-col">
                    URL
                </div>
            </div>
            <tbody>
                {rows}
            </tbody>
        </div>
    }

    render() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Publication Type
                    </div>
                    <div className="flex-col">
                        {this.props.publication.publicationType}
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Title
                    </div>
                    <div className="flex-col">
                        {this.props.publication.title}
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Publisher
                    </div>
                    <div className="flex-col">
                        {this.props.publication.journal}
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Date
                    </div>
                    <div className="flex-col">
                        {this.props.publication.date}
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        URL
                    </div>
                    <div className="flex-col">
                        {this.props.publication.url}
                    </div>
                </div>
                <div className="flex-row" style={{ fontWeight: 'bold', color: "rgba(150,150,150)", marginTop: '1em' }}>
                    CITATION
                </div>
                <div className="flex-row">
                    <i>Citation information not provided by ORCID API???</i>
                </div>


                <div className="flex-row" style={{ fontWeight: 'bold', color: "rgba(150,150,150)", marginTop: '1em' }}>
                    IDENTIFIERS
                </div>
                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>
                    {this.renderExternalIds()}
                </div>

                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>
                    {/* <Button variant="danger" onClick={this.props.onDeleteConfirm} style={{ marginRight: '0.5em' }}>
                        <span className="fa fa-trash" /> Confirm
                    </Button> */}
                    <div className="btn-group">
                        <Button variant="outline-danger" onClick={this.props.onCancel}>
                            <span className="fa fa-times-circle" /> Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </Form >;
    }
}