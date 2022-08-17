import { LocationPoint, LocationType, Model, ReviewAndSubmitData } from "apps/ORCIDLink/Model";
import { Component } from "react";
import { FieldState, FieldStateValid, FieldStatus } from "../../../common";
import Editor from './Editor';

export enum EditorStatus {
    INITIAL = 'INITIAL',
    VALIDATING = 'VALIDATING',
    SAVING = 'SAVING',
    EDITABLE = 'EDITABLE',
    MODIFIED = 'MODIFIED',
    ERROR = 'ERROR',
}

export interface LocationPointEditor {
    status: EditorStatus;
    form: {
        place: FieldState<string, string>
        latitude: FieldState<string, number>
        longitude: FieldState<string, number>
    }
}

export interface ControllerProps {
    model: Model;
    onDone: (locationPoint: LocationPoint) => void;
}


interface ControllerState {
    editor: LocationPointEditor;
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
                    latitude: {
                        status: FieldStatus.NONE
                    },
                    longitude: {
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

    async updateLatitude(value: string) {
        const latitude = ((latitude: FieldState<string, number>): FieldState<string, number> => {
            // TODO: validation
            switch (latitude.status) {
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
        })(this.state.editor.form.latitude);
        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    latitude
                }
            }
        });
    }

    async updateLongitude(value: string) {
        const longitude = ((longitude: FieldState<string, number>): FieldState<string, number> => {
            // TODO: validation
            switch (longitude.status) {
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
        })(this.state.editor.form.latitude);

        this.setState({
            editor: {
                ...this.state.editor,
                form: {
                    ...this.state.editor.form,
                    longitude
                }
            }
        });
    }
    onUpdatePlaceName(value: string) {
        this.updatePlaceName(value);
    }

    onUpdateLatitude(value: string) {
        this.updateLatitude(value);
    }

    onUpdateLongitude(value: string) {
        this.updateLongitude(value);
    }

    transform(): LocationPoint {
        // function ifValid(field: FieldState, name: string) {
        //     if (field.status !== FieldStatus.VALID) {
        //         throw new Error(`Cannot transform - field "${name}" not valid`);
        //     }
        //     return field.value
        // }

        const { place, latitude, longitude } = this.state.editor.form;

        console.log(place, latitude, longitude);
        if (!(place.status === FieldStatus.VALID && latitude.status === FieldStatus.VALID && longitude.status === FieldStatus.VALID)) {
            throw new Error('Attempt to transform fields when one or more are not VALID');
        }

        // const editor = this.state.editor.form
        // const place = (editor.place.status === FieldStatus.VALID) ? editor.place.value : throw new Error('')
        // const latitude = (editor.latitude.status === FieldStatus.VALID) ? editor.latitude.value;
        // const longitude = (editor.longitude.status === FieldStatus.VALID) ? editor.longitude.value;
        return {
            type: LocationType.POINT,
            place: place.value,
            point: {
                latitude: latitude.value, longitude: longitude.value
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
            onUpdateLatitude={this.onUpdateLatitude.bind(this)}
            onUpdateLongitude={this.onUpdateLongitude.bind(this)}
            onDone={this.onDone.bind(this)}
        />
    }
}
