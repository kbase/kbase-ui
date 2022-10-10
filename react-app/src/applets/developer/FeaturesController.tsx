import { Component } from 'react';
import Features from './Features';
import * as Cookie from 'es-cookie';

// Just for now; 
// TODO: move into config.

export interface Feature {
    id: string;
    label: string;
    description: string;
}

const FEATURES: Array<Feature> = [{
    id: 'ce-new-policy',
    label: 'Credit Engine - New Policy Updated',
    description: 'Enables the new Use Policy (T&C), expires the current ones, which affects signup, signin, and account manager'
}]

export interface FeaturesControllerProps {
    setTitle: (title: string) => void;
}

export interface FeatureState extends Feature {
    status: 'enabled' | 'disabled';
}

interface FeaturesControllerState {
    features: Array<FeatureState>

}

const FEATURE_COOKIE_SEPARATOR = /s*,s*/;

export default class FeaturesController extends Component<FeaturesControllerProps, FeaturesControllerState> {
    constructor(props: FeaturesControllerProps) {
        super(props);
        this.state = {
            features: []
        }
    }
    componentDidMount() {
        this.props.setTitle('Developer Tools - Features');
        this.loadFeatures();
    }

    loadFeatures() {
        const cookieFeatures = (Cookie.get('kbase_features') || '').split(FEATURE_COOKIE_SEPARATOR);
        const features = FEATURES.map<FeatureState>((feature: Feature) => {
            const status = cookieFeatures.includes(feature.id) ? 'enabled' : 'disabled';
            return { ...feature, status };
        });
        console.log('features', features);
        this.setState({
            features
        });
    }

    // Actions

    getFeatures() {

    }

    toggleFeature(featureId: string) {
        const features = this.state.features.map((feature) => {
            if (featureId === feature.id) {
                feature.status = feature.status === 'disabled' ? 'enabled' : 'disabled'
            }
            return feature;
        });
        this.setState({
            features
        }, () => {
            const enabledFeatures = features
                .filter(({ status }) => {
                    return status === 'enabled';
                })
                .map(({ id }) => {
                    return id;
                })
                .join(',');
            if (enabledFeatures.length > 0) {
                Cookie.set('kbase_features', enabledFeatures, { expires: 60, secure: true, path: '/', sameSite: 'strict' });
            } else {
                Cookie.remove('kbase_features');
            }
        })
    }


    // Renderers

    render() {
        return (
            <Features
                features={this.state.features}
                toggleFeature={this.toggleFeature.bind(this)} />
        );
    }
}
