import { Component } from 'react';
import { Form, Table } from 'react-bootstrap';
import styles from './Features.module.css';
import { FeatureState } from './FeaturesController';

export interface FeaturesProps {
    features: Array<FeatureState>
    toggleFeature: (id: string) => void;
}

interface FeaturesState { }

export default class Features extends Component<FeaturesProps, FeaturesState> {
    onClick(id: string) {
        this.props.toggleFeature(id);
    }

    renderFeatures() {
        const rows = this.props.features.map(({ id, label, description, status }) => {
            return <tr key={id}>
                <td>
                    {id}
                </td>
                <td>
                    {label}
                </td>
                <td>
                    {description}
                </td>
                <td>
                    {status}
                </td>
                <td>
                    <Form.Check type="checkbox"
                        value="enabled"
                        readOnly
                        checked={status === 'enabled'}
                        onClick={() => { this.onClick(id); }}
                    />
                </td>
            </tr>
        });

        return <Table>
            <thead>
                <tr>
                    <th>
                        ID
                    </th>
                    <th>
                        Label
                    </th>
                    <th>
                        Description
                    </th>
                    <th>
                        Status
                    </th>
                    <th>

                    </th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }

    render() {
        return (
            <div className={styles.Main}>
                <p>Welcome to the Features Editor</p>
                <div>
                    {this.renderFeatures()}
                </div>
            </div>
        );
    }
}
