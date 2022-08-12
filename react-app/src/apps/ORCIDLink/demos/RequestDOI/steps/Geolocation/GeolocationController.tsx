import { Model, GeolocationData, Location } from "apps/ORCIDLink/Model";
import { Component } from "react";
import GolocationForm from './GeolocationForm';

export interface GeolocationControllerProps {
    model: Model;
    onDone: (geolocationData: GeolocationData) => void;
}

interface GeolocationControllerState {
    geolocationData: GeolocationData;
}

export default class GeolocationController extends Component<GeolocationControllerProps, GeolocationControllerState> {
    constructor(props: GeolocationControllerProps) {
        super(props);
        this.state = {
            geolocationData: {
                locations: []
            }
        }
    }
    addLocation(location: Location) {
        this.setState({
            geolocationData: {
                locations: this.state.geolocationData.locations.concat([location])
            }
        })
    }
    removeLocation(position: number) {
        const locations = this.state.geolocationData.locations.slice();
        locations.slice(position, 1);
        this.setState({
            geolocationData: {
                locations
            }
        })
    }
    render() {
        return <GolocationForm
            model={this.props.model}
            onDone={() => {
                this.props.onDone(this.state.geolocationData);
            }}
            geolocationData={this.state.geolocationData}
            addLocation={this.addLocation.bind(this)}
            removeLocation={this.removeLocation.bind(this)}
        />
    }
}
