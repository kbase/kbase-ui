import Empty from 'components/Empty';
import TypeIcon from 'components/TypeIcon/TypeIcon';
import UILink from 'components/UILink2';
import { AuthInfo } from 'contexts/EuropaContext';
import { DataObject } from 'lib/clients/NarrativeModel';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Config } from 'types/config';
import { getWSTypeName } from '../../utils/stringUtils';
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
    const [typeModule, typeName, versionMajor, versionMinor] = obj.obj_type.split(/[.-]/);
    return (
      <div key={key} className="row my-3">
        <div className="col-auto">
          <TypeIcon typeName={typeName} />
        </div>
        <div className="col overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
          <div className="-name">
            <UILink path={`dataview/${workspaceId}/${obj.name}`} type="kbaseui" newWindow={true}>
              {obj.name}
            </UILink>
          </div>
          <div className="-type">
            <UILink path={`spec/type/${obj.obj_type}`} type="kbaseui" newWindow={true}>
              {typeName} ({typeModule}-{versionMajor}.{versionMinor})
            </UILink>
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
            <Empty message="This Narrative has no data objects" icon="database" />
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
    return <div className="container-fluid">{rows}</div>;
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
