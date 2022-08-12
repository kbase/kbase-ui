import { Component } from "react";
import { Stack, Row, Col, Button, FormControl } from "react-bootstrap";
import { LocationPointEditor } from "./Controller";

export interface EditorProps {
    editor: LocationPointEditor,
    onUpdatePlaceName: (placeName: string) => void;
    onUpdateLatitude: (placeName: string) => void;
    onUpdateLongitude: (placeName: string) => void;
    onDone: () => void;
}

interface EditorState {
}

export default class Editor extends Component<EditorProps, EditorState>{
    renderEditor() {
        return <Stack gap={2}>
            <Row>
                <Col md={2}>Place name</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdatePlaceName(e.currentTarget.value); }} /></Col>
            </Row>
            <Row>
                <Col md={2}>Latitude</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdateLongitude(e.currentTarget.value); }} /></Col>
            </Row>
            <Row>
                <Col md={2}>Longitude</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdateLatitude(e.currentTarget.value); }} /></Col>
            </Row>
        </Stack>
    }
    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }
        } >
            <Row>
                {this.renderEditor()}
            </Row>
            <Row>
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button
                            variant="primary"
                            className="w-auto"
                            onClick={this.props.onDone}>
                            <span className="fa fa-plus" /> Add
                        </Button>
                    </Row>
                </Col>
            </Row>
        </Stack >;
    }
}
