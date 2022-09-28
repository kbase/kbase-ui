import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { DataObject } from '../../utils/NarrativeModel';
import { getWSTypeName } from '../../utils/stringUtils';
import TypeIcon from 'components/TypeIcon/TypeIcon';
import { Config } from 'types/config';
import { AuthInfo } from 'contexts/Auth';
import Empty from 'components/Empty';
import './DataView.css';

interface Props {
    accessGroup: number;
    dataObjects: Array<DataObject>;
    config: Config;
    authInfo: AuthInfo;
}

export default class DataView extends React.Component<Props, {}> {
    // View for each row in the data listing for the narrative
    renderRow(workspaceId: number, obj: DataObject) {
        const key = obj.name;
        const [typeModule, typeName, versionMajor, versionMinor] =
            obj.obj_type.split(/[.-]/);
        return (
            <div key={key} className="row my-3">
                <div className="col-auto">
                    <TypeIcon
                        typeName={typeName}
                    />
                </div>
                <div
                    className="col overflow-hidden"
                    style={{ textOverflow: 'ellipsis' }}
                >
                    <div className="-name">
                        <a
                            href={`#dataview/${workspaceId}/${obj.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {obj.name}
                        </a>
                    </div>
                    {/*<div className="">{obj.readableType}</div>*/}
                    <div className="-type">
                        <a
                            href={`#spec/type/${obj.obj_type}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {typeName} ({typeModule}-{versionMajor}.
                            {versionMinor})
                        </a>
                        {/*{obj.readableType}*/}
                    </div>
                </div>
            </div>
        );
    }

    renderEmpty() {
        return (
            <Container fluid className="mt-3 px-0">
                <Row>
                    <Col>
                        <Empty
                            message="This Narrative has no data objects"
                            icon="database"
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    renderDataObjects() {
        const { accessGroup } = this.props;
        const rows = this.props.dataObjects
            // why limit to 50? Performance should not be an issue.
            .slice(0, 50)
            .map((obj) => {
                obj.readableType = getWSTypeName(obj.obj_type);
                return obj;
            })
            .sort((a, b) => a.readableType.localeCompare(b.readableType))
            .map((obj) => this.renderRow(accessGroup, obj));
        return <div className="container-fluid p-0">{rows}</div>;
    }

    renderState() {
        if (this.props.dataObjects.length === 0) {
            return this.renderEmpty();
        }
        return this.renderDataObjects();
    }

    render() {
        return <div className="DataView">{this.renderState()}</div>;
    }
}
