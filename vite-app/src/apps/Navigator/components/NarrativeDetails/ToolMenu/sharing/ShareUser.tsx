import { UserPermission, assertUserPermission } from 'lib/kb_lib/comm/coreServices/Workspace';
import React, { Component } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { PERM_MAPPING } from './Definitions';

/* The individual user that has some sharing permissions */
interface ShareUserProps {
    username: string;
    realname: string;
    permission: UserPermission;
    currentUserPermission: UserPermission;
    key: string;

    updatePermission: (username: string, newPerm: UserPermission) => void;
    removeAccess: (username: string) => void;
}

export default class ShareUser extends Component<ShareUserProps> {
    handleRemoveAccessClick() {
        this.props.removeAccess(this.props.username);
    }
    handlePermissionChange(ev: React.ChangeEvent<HTMLSelectElement>) {
        const newPermission = ev.target.value;
        assertUserPermission(newPermission);
        this.props.updatePermission(this.props.username, newPermission);
    }
    render() {
        let permDropdown = null;
        if (this.props.currentUserPermission === 'a') {
            permDropdown = (
                <div>
                    <Form.Select
                        onChange={this.handlePermissionChange.bind(this)}
                        defaultValue={this.props.permission}
                    >
                        {['r', 'w', 'a'].map((permissionCode) => {
                            return (
                                <option
                                    value={permissionCode}
                                    key={permissionCode}

                                >
                                    {PERM_MAPPING[permissionCode]}
                                </option>
                            );
                        })}
                    </Form.Select>
                </div>
            );
        } else {
            permDropdown = (
                <div className="">{PERM_MAPPING[this.props.permission]}</div>
            );
        }
        return (
            <Row className="mb-1 align-items-center">
                <Col md={7}>
                    {this.props.realname} ({this.props.username})
                </Col>
                <Col md={4}>{permDropdown}</Col>
                <Col md={1}>
                    <Button
                        variant="danger"
                        onClick={this.handleRemoveAccessClick.bind(this)}
                    >
                        <span className="fa fa-times" />
                    </Button>
                </Col>
            </Row>
        );
    }
}
