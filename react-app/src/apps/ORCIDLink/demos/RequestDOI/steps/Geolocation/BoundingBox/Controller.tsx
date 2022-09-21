import { Model } from "apps/ORCIDLink/Model";
import { LocationBoundingBox, LocationType } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import { FieldState, FieldStatus } from "../../../common";
import Editor from './Editor';

export enum EditorStatus {
    INITIAL = 'INITIAL',
    VALIDATING = 'VALIDATING',
    SAVING = 'SAVING',
    EDITABLE = 'EDITABLE',
    MODIFIED = 'MODIFIED',
    ERROR = 'ERROR',
}

export interface BoundigBoxEditor {
    status: EditorStatus;
    form: {
        place: FieldState<string, string>
        westLongitude: FieldState<string, number>
        southLatitude: FieldState<string, number>
        eastLongitude: FieldState<string, number>
        northLatitude: FieldState<string, number>
    }
}

export interface ControllerProps {
    model: Model;
    onDone: (boundingBox: LocationBoundingBox) => void;
}


interface ControllerState {
    editor: BoundigBoxEditor;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            editor: {
                status: EditorStatus.INITIAL,
                form: {
                    place: {
                        status: FieldStatus.NONE
                    },
                    westLongitude: {
                        status: FieldStatus.NONE
                    },
                    southLatitude: {
                        status: FieldStatus.NONE
                    },
                    eastLongitude: {
                        status: FieldStatus.NONE
                    },
                    northLatitude: {
                        status: FieldStatus.NONE
                    }
                }
            }
        }
    }

    async updatePlaceName(value: string) {
        const place = ((place: FieldState<string, string>): FieldState<string, string> => {
            // TODO: validation
            switch (place.status) {
                case FieldStatus.NONE:
                // return place;
                case FieldStatus.INITIAL:
                case FieldStatus.VALID:
                case FieldStatus.INVALID:
                    return {
                        status: FieldStatus.VALID,
                        rawValue: value,
                        value
                    }
            }
        })(this.state.editor.form.place);
        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    place
                }
            }
        });
    }

    async updateWestLongitude(value: string) {
        const westLongitude = ((westLongitude: FieldState<string, number>): FieldState<string, number> => {
            // TODO: validation
            switch (westLongitude.status) {
                case FieldStatus.NONE:
                // return latitude;
                case FieldStatus.INITIAL:
                case FieldStatus.VALID:
                case FieldStatus.INVALID:
                    return {
                        status: FieldStatus.VALID,
                        rawValue: value,
                        value: parseInt(value, 10)
                    }
            }
        })(this.state.editor.form.westLongitude);
        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    westLongitude
                }
            }
        });
    }

    async updateSouthLatitude(value: string) {
        const southLatitude = ((southLatitude: FieldState<string, number>): FieldState<string, number> => {
            // TODO: validation
            switch (southLatitude.status) {
                case FieldStatus.NONE:
                // return latitude;
                case FieldStatus.INITIAL:
                case FieldStatus.VALID:
                case FieldStatus.INVALID:
                    return {
                        status: FieldStatus.VALID,
                        rawValue: value,
                        value: parseInt(value, 10)
                    }
            }
        })(this.state.editor.form.southLatitude);
        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    southLatitude
                }
            }
        });
    }

    async updateEastLongitude(value: string) {
        const eastLongitude = ((eastLongitude: FieldState<string, number>): FieldState<string, number> => {
            // TODO: validation
            switch (eastLongitude.status) {
                case FieldStatus.NONE:
                // return longitude;
                case FieldStatus.INITIAL:
                case FieldStatus.VALID:
                case FieldStatus.INVALID:
                    return {
                        status: FieldStatus.VALID,
                        rawValue: value,
                        value: parseInt(value, 10)
                    }
            }
        })(this.state.editor.form.eastLongitude);

        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    eastLongitude
                }
            }
        });
    }

    async updateNorthLatitude(value: string) {
        const northLatitude = ((northLatitude: FieldState<string, number>): FieldState<string, number> => {
            // TODO: validation
            switch (northLatitude.status) {
                case FieldStatus.NONE:
                // return longitude;
                case FieldStatus.INITIAL:
                case FieldStatus.VALID:
                case FieldStatus.INVALID:
                    return {
                        status: FieldStatus.VALID,
                        rawValue: value,
                        value: parseInt(value, 10)
                    }
            }
        })(this.state.editor.form.northLatitude);

        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    northLatitude
                }
            }
        });
    }

    onUpdatePlaceName(value: string) {
        this.updatePlaceName(value);
    }

    onUpdateWestLongitude(value: string) {
        this.updateWestLongitude(value);
    }

    onUpdateSouthLatitude(value: string) {
        this.updateSouthLatitude(value);
    }

    onUpdateEastLongitude(value: string) {
        this.updateEastLongitude(value);
    }

    onUpdateNorthLatitude(value: string) {
        this.updateNorthLatitude(value);
    }

    transform(): LocationBoundingBox {
        // function ifValid(field: FieldState, name: string) {
        //     if (field.status !== FieldStatus.VALID) {
        //         throw new Error(`Cannot transform - field "${name}" not valid`);
        //     }
        //     return field.value
        // }

        const { place, westLongitude, southLatitude, eastLongitude, northLatitude } = this.state.editor.form;

        if (!(place.status === FieldStatus.VALID &&
            westLongitude.status === FieldStatus.VALID &&
            southLatitude.status === FieldStatus.VALID &&
            eastLongitude.status === FieldStatus.VALID &&
            northLatitude.status === FieldStatus.VALID
        )) {
            throw new Error('Attempt to transform fields when one or more are not VALID');
        }

        // const editor = this.state.editor.form
        // const place = (editor.place.status === FieldStatus.VALID) ? editor.place.value : throw new Error('')
        // const latitude = (editor.latitude.status === FieldStatus.VALID) ? editor.latitude.value;
        // const longitude = (editor.longitude.status === FieldStatus.VALID) ? editor.longitude.value;
        return {
            type: LocationType.BOUNDING_BOX,
            place: place.value,
            boundingBox: {
                westLongitude: westLongitude.value,
                southLatitude: southLatitude.value,
                eastLongitude: eastLongitude.value,
                northLatitude: northLatitude.value
            }
        }
    }

    onDone() {
        this.props.onDone(this.transform())
    }

    render() {
        return <Editor
            editor={this.state.editor}
            onUpdatePlaceName={this.onUpdatePlaceName.bind(this)}
            onUpdateWestLongitude={this.onUpdateWestLongitude.bind(this)}
            onUpdateSouthLatitude={this.onUpdateSouthLatitude.bind(this)}
            onUpdateEastLongitude={this.onUpdateEastLongitude.bind(this)}
            onUpdateNorthLatitude={this.onUpdateNorthLatitude.bind(this)}
            onDone={this.onDone.bind(this)}
        />
    }
}
