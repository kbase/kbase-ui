import { Model } from "apps/ORCIDLink/Model";

import Well from "components/Well";
import { Component } from "react";
import { Stack, Row, Col, Button, Form, Table } from "react-bootstrap";

import LocationPointEditor from './LocationPointEditor/Controller';
import BoundingBoxEditor from './BoundingBox/Controller';
import { GeolocationData, LocationType, LocationPoint, LocationBoundingBox, Location } from "apps/ORCIDLink/ORCIDLinkClient";
import Empty from "components/Empty";


export interface GeolocationFormProps {
    geolocationData: GeolocationData;
    model: Model;
    onDone: () => void;
    addLocation: (location: Location) => void;
    removeLocation: (position: number) => void;
}

export enum EditorSelection {
    NONE = 'NONE',
    SELECTED = 'SELECTED'
}

export enum EditorStatus {
    INITIAL = 'INITIAL',
    VALID = 'VALID',
    INVALID = 'INVALD'
}

export interface EditorStateBase {
    selection: EditorSelection;
}

export interface EditorStateNone extends EditorStateBase {
    selection: EditorSelection.NONE
}

export interface EditorStateSelectedBase extends EditorStateBase {
    selection: EditorSelection.SELECTED;
    status: EditorStatus;
    locationType: LocationType;
}

export interface EditorStateSelectedInitial extends EditorStateSelectedBase {
    status: EditorStatus.INITIAL,
}

export interface EditorStateSelectedValid extends EditorStateSelectedBase {
    status: EditorStatus.VALID
}

export interface EditorStateSelectedInvalid extends EditorStateSelectedBase {
    status: EditorStatus.INVALID
}

export type EditorState =
    EditorStateNone |
    EditorStateSelectedInitial |
    EditorStateSelectedValid |
    EditorStateSelectedInvalid;


interface GeolocationFormState {
    editor: EditorState;
    // locationEditor: LocationEditor
}

// export enum EditorStatus {
//     INITIAL = 'INITIAL',
//     VALIDATING = 'VALIDATING',
//     SAVING = 'SAVING',
//     EDITABLE = 'EDITABLE',
//     MODIFIED = 'MODIFIED',
//     ERROR = 'ERROR',
// }

// export interface LocationEditorBase {
//     status: EditorStatus,
//     type: LocationType,
//     form: any,
//     final?: Location
// }

// export interface LocationPointEditor extends LocationEditorBase {
//     type: LocationType.POINT,
//     form: {
//         place: FieldState<string>
//         latitude: FieldState<number>
//         longitude: FieldState<number>
//     },
//     final?: LocationPoint
// }

// export interface LocationPolygonEditor extends LocationEditorBase {
//     type: LocationType.POLYGON,
//     form: {
//         place: FieldState<string>
//         polygon: FieldState<Array<{
//             latitude: FieldState<number>
//             longitude: FieldState<number>
//         }>>
//     },
//     final?: LocationPolygon
// }

// export interface LocationBoundingBoxEditor extends LocationEditorBase {
//     type: LocationType.POLYGON,
//     form: {
//         place: FieldState<string>
//         westLongitude: FieldState<number>
//         eastLongitude: FieldState<number>
//         nortLatitutde: FieldState<number>
//         southLatitude: FieldState<number>
//     },
//     final?: LocationBoundingBox
// }

// export type LocationEditor =
//     LocationPointEditor |
//     LocationPolygonEditor |
//     LocationBoundingBoxEditor

export default class GeolocationForm extends Component<GeolocationFormProps, GeolocationFormState>{
    constructor(props: GeolocationFormProps) {
        super(props);
        this.state = {
            editor: {
                selection: EditorSelection.NONE
            }
        }
    }
    renderLocations() {
        if (this.props.geolocationData.locations.length === 0) {
            return <Empty message="No locations yet entered" />
        }
        const rows = (() => {
            // if (this.props.geolocationData.locations.length === 0) {
            //     // return <Empty message="No locations" />;
            //     return <tr><td colSpan={2} style={{ textAlign: 'center' }}><i>No locations yet entered</i></td></tr>
            // }
            return this.props.geolocationData.locations.map((location, index) => {
                const description = (() => {
                    switch (location.type) {
                        case LocationType.POINT:
                            return 'Point';
                        case LocationType.POLYGON:
                            return 'Polygon';
                        case LocationType.BOUNDING_BOX:
                            return 'Bounding Box';
                    }
                })();
                return <tr key={index}>
                    <td>
                        {location.place}
                    </td>
                    <td>
                        {description}
                    </td>
                </tr>
            });
        })();
        return <Table size="sm">
            <colgroup>
                <col />
                <col style={{ width: '10em' }} />
            </colgroup>
            <thead>
                <tr>
                    <th>Place</th>
                    <th>Location Type</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }


    renderEditor() {
        switch (this.state.editor.selection) {
            case EditorSelection.NONE:
                return <div>Select a location type to invoke the associated editor</div>
            case EditorSelection.SELECTED:
                switch (this.state.editor.status) {
                    case EditorStatus.INITIAL:
                    case EditorStatus.INVALID:
                    case EditorStatus.VALID:
                        switch (this.state.editor.locationType) {
                            case LocationType.POINT:
                                return <LocationPointEditor model={this.props.model} onDone={(locationPoint: LocationPoint) => this.props.addLocation(locationPoint)} />
                            case LocationType.POLYGON:
                                return <div>Not supported yet</div>
                            case LocationType.BOUNDING_BOX:
                                return <BoundingBoxEditor model={this.props.model}
                                    onDone={(boundingBox: LocationBoundingBox) => this.props.addLocation(boundingBox)} />
                        }
                }
        }
    }

    onLocationTypeSelect(locationType: string) {
        switch (locationType) {
            case 'point':
                this.setState({
                    editor: {
                        selection: EditorSelection.SELECTED,
                        status: EditorStatus.INITIAL,
                        locationType: LocationType.POINT
                    }
                });
                break;
            case 'polygon':
                this.setState({
                    editor: {
                        selection: EditorSelection.SELECTED,
                        status: EditorStatus.INITIAL,
                        locationType: LocationType.POLYGON
                    }
                });
                break;
            case 'bounding-box':
                this.setState({
                    editor: {
                        selection: EditorSelection.SELECTED,
                        status: EditorStatus.INITIAL,
                        locationType: LocationType.BOUNDING_BOX
                    }
                });
                break;
            default:
                this.setState({
                    editor: {
                        selection: EditorSelection.NONE,
                    }
                });
                break;
        }
    }

    renderControls() {
        return <Stack gap={2} style={{ marginBottom: '1em' }}>
            <Row>
                <Col md="auto" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontWeight: 'bold', color: 'rgba(150, 150, 150, 1)' }}>
                    Geolocation Type
                </Col>
                <Col>
                    <Form.Select onChange={(e) => { this.onLocationTypeSelect(e.currentTarget.value); }}>
                        <option value="">- Select a location type -</option>
                        <option value="point">Point (Lat + Long)</option>
                        <option value="polygon">Polygon (multiple Lat + Long)</option>
                        <option value="bounding-box">Bounding Box (East &amp; West Lat + Long)</option>
                    </Form.Select>
                </Col>

            </Row>
        </Stack>;
    }

    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }} >
            <Row>
                <Col>
                    <h3>Locations</h3>
                    <Well style={{ padding: '0.5em', marginRight: '0.25em' }}>
                        {this.renderLocations()}
                    </Well>
                </Col>
                <Col>
                    <h3>Location Editor</h3>
                    {this.renderControls()}
                    <Well style={{ padding: '0.5em', marginLeft: '0.25em' }}>
                        {this.renderEditor()}
                    </Well>
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack >;
    }
}
