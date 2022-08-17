import { Component } from "react";
import { Stack, Row, Col, Button, FormControl } from "react-bootstrap";
import { BoundigBoxEditor } from "./Controller";

export interface EditorProps {
    editor: BoundigBoxEditor,
    onUpdatePlaceName: (placeName: string) => void;
    onUpdateWestLongitude: (placeName: string) => void;
    onUpdateSouthLatitude: (placeName: string) => void;
    onUpdateEastLongitude: (placeName: string) => void;
    onUpdateNorthLatitude: (placeName: string) => void;
    onDone: () => void;
}

interface EditorState {
}

export default class Editor extends Component<EditorProps, EditorState>{
    renderEditor() {
        return <Stack gap={2}>
            <Row>
                <Col md={4}>Place name</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdatePlaceName(e.currentTarget.value); }} /></Col>
            </Row>
            <Row>
                <Col md={4}>West Longitude</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdateWestLongitude(e.currentTarget.value); }} /></Col>
            </Row>
            <Row>
                <Col md={4}>South Latitude</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdateSouthLatitude(e.currentTarget.value); }} /></Col>
            </Row>
            <Row>
                <Col md={4}>East Longitude</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdateEastLongitude(e.currentTarget.value); }} /></Col>
            </Row>
            <Row>
                <Col md={4}>North Latitude</Col>
                <Col><FormControl type="text" onChange={(e) => { this.props.onUpdateNorthLatitude(e.currentTarget.value); }} /></Col>
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
