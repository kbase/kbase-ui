import { Component } from 'react';
import DeleteNarrative from './DeleteNarrative';
import CopyItem from './CopyItem';
import LinkOrgItem from './LinkOrgItem';
import RenameItem from './RenameItem';
import SharingItem from './sharing/SharingItem';
import { NarrativeSearchDoc } from '../../../utils/NarrativeModel';
import { AuthInfo } from '../../../../../contexts/Auth';
import { Config } from '../../../../../types/config';
import { Dropdown, Modal } from 'react-bootstrap';
import { UserPermission } from './ToolMenuWrapper';
import './ToolMenu.css';

interface MenuItem {
    title: string;
    icon: string;
    dialogTitle?: string;
    render: (props: ControlMenuItemProps) => JSX.Element;
    // menuComponent: React.ComponentType<ControlMenuItemProps>;
}

export interface ControlMenuItemProps {
    // authInfo: AuthInfo;
    authInfo: AuthInfo;
    config: Config;
    narrative: NarrativeSearchDoc;

    cancelFn?: () => void;
    doneFn: () => void;
}

const modalContent: Record<string, MenuItem> = {
    share: {
        title: 'Manage Sharing',
        icon: 'fa fa-share-alt',
        dialogTitle: 'Manage Sharing',
        render: (props: ControlMenuItemProps) => {
            return <SharingItem {...props} />;
        },
    },
    copy: {
        title: 'Copy this Narrative',
        icon: 'fa fa-copy',
        dialogTitle: 'Make a Copy',
        render: (props: ControlMenuItemProps) => {
            return <CopyItem {...props} />;
        },
    },
    rename: {
        title: 'Rename',
        icon: 'fa fa-paragraph',
        dialogTitle: 'Rename Narrative',
        render: (props: ControlMenuItemProps) => {
            return <RenameItem {...props} />;
        },
    },
    'link-to-org': {
        title: 'Link to Organization',
        icon: 'fa fa-users',
        dialogTitle: 'Link to Organization',
        render: (props: ControlMenuItemProps) => {
            return <LinkOrgItem {...props} />;
        },
    },
    delete: {
        title: 'Delete',
        icon: 'fa fa-trash-o',
        dialogTitle: 'Delete Narrative?',
        render: (props: ControlMenuItemProps) => {
            return <DeleteNarrative {...props} />;
        },
    },
};

export enum ToolStatus {
    NONE = 'NONE',
    SELECTED = 'SELECTED',
}

export interface ToolStateBase {
    status: ToolStatus;
}

export interface ToolStateNone extends ToolStateBase {
    status: ToolStatus.NONE;
}

export interface ToolStateSelected extends ToolStateBase {
    status: ToolStatus.SELECTED;
    content: MenuItem;
}

export type ToolState = ToolStateNone | ToolStateSelected;

interface ToolMenuState {
    toolState: ToolState;
}

interface ToolMenuProps {
    narrative: NarrativeSearchDoc;
    permission: UserPermission;
    authInfo: AuthInfo;
    config: Config;
    cancelFn?: () => void;
    doneFn: () => void;
}

export default class ToolMenu extends Component<ToolMenuProps, ToolMenuState> {
    constructor(props: ToolMenuProps) {
        super(props);
        this.state = {
            toolState: {
                status: ToolStatus.NONE,
            },
        };
    }

    closeModal() {
        this.setState({
            toolState: {
                status: ToolStatus.NONE,
            },
        });
    }

    renderIcon(icon: string) {
        return (
            <div className="navbar-icon">
                <span className={`fa fa-${icon}`}></span>
            </div>
        );
    }

    handleSelectMenuItem(eventKey: any) {
        const content = modalContent[eventKey];
        if (!content) {
            return;
        }
        this.setState({
            toolState: {
                status: ToolStatus.SELECTED,
                content,
            },
        });
    }

    renderMenu() {
        return (
            <Dropdown onSelect={this.handleSelectMenuItem.bind(this)}>
                <Dropdown.Toggle variant="default">
                    <span className="fa fa-cog fa-2x"></span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item
                        eventKey="share"
                        disabled={this.props.permission.permission !== 'a'}
                    >
                        {this.renderIcon('share-alt')}
                        <span>Manage Sharing</span>
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="copy">
                        {this.renderIcon('files-o')}
                        <span>Copy this Narrative</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                        eventKey="rename"
                        disabled={this.props.permission.permission !== 'a'}
                    >
                        {this.renderIcon('paragraph')}
                        <span>Rename</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                        eventKey="link-to-org"
                        disabled={this.props.permission.permission !== 'a'}
                    >
                        {this.renderIcon('users')}
                        <span>Link to Organization</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                        eventKey="delete"
                        disabled={this.props.permission.permission !== 'a'}
                    >
                        {this.renderIcon('trash')}
                        <span>Delete</span>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    // renderModalContent(item: MenuItem) {
    //     return (
    //         <RuntimeContext.Consumer>
    //             {(value) => {
    //                 if (value === null) {
    //                     return null;
    //                 }
    //                 const { authState, config } = value;

    //                 if (
    //                     authState.status !== AuthenticationStatus.AUTHENTICATED
    //                 ) {
    //                     return null;
    //                 }

    //                 const props = {
    //                     authInfo: authState.authInfo,
    //                     config,
    //                     narrative: this.props.narrative,
    //                     cancelFn: () => this.closeModal(),
    //                     doneFn: () => this.props.doneFn,
    //                 };
    //                 return item.render(props);
    //             }}
    //         </RuntimeContext.Consumer>
    //     );
    // }

    renderModalContent(item: MenuItem) {
        const props = {
            authInfo: this.props.authInfo,
            config: this.props.config,
            narrative: this.props.narrative,
            cancelFn: () => this.closeModal(),
            doneFn: () => this.props.doneFn,
        };
        return item.render(props);
    }

    renderModal() {
        const content = (() => {
            if (this.state.toolState.status === ToolStatus.NONE) {
                return null;
            }
            return this.state.toolState.content;
        })();

        return (
            <Modal
                show={this.state.toolState.status === ToolStatus.SELECTED}
                onHide={this.closeModal.bind(this)}
                dialogClassName="ToolMenuModal"
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{content && content.title}</Modal.Title>
                </Modal.Header>

                {content && this.renderModalContent(content)}
            </Modal>
        );
    }

    render() {
        let menu = null;
        menu = this.renderMenu();

        // const modal = ((state) => {
        //     if (!state.showModal) {
        //         return null;
        //     }
        //     if (!state.modalItem) {
        //         return null;
        //     }
        //     const { dialogTitle, menuComponent } = state.modalItem;
        //     return (
        //         <Modal
        //             closeFn={() => this.closeModal()}
        //             title={dialogTitle}
        //             withCloseButton={true}
        //         >
        //             <RuntimeContext.Consumer>
        //                 {(value) => {
        //                     if (value === null) {
        //                         return null;
        //                     }
        //                     const { authState, config } = value;

        //                     if (
        //                         authState.status !==
        //                         AuthenticationStatus.AUTHENTICATED
        //                     ) {
        //                         return null;
        //                     }
        //                     return React.createElement(menuComponent, {
        //                         authInfo: authState.authInfo,
        //                         config,
        //                         narrative: this.props.narrative,
        //                         cancelFn: () => this.closeModal(),
        //                         doneFn: () => this.props.doneFn,
        //                     });
        //                 }}
        //             </RuntimeContext.Consumer>
        //         </Modal>
        //     );
        // })(this.state);

        return (
            <div className="ToolMenu">
                {/*<span*/}
                {/*  className="fa fa-cog"*/}
                {/*  style={{ cursor: 'pointer' }}*/}
                {/*  onClick={(e) => this.menuClicked()}*/}
                {/*></span>*/}
                {this.renderModal()}
                {menu}
            </div>
        );
    }

    // menuItem(item: MenuItem, idx: number) {
    //     return (
    //         <div
    //             key={item.title}
    //             style={{ flexFlow: 'row nowrap', cursor: 'pointer' }}
    //             onClick={(e) => {
    //                 this.menuItemClicked(item);
    //             }}
    //         >
    //             <span className={`${item.icon} w-10 blue`} />
    //             <span className="ml2">{item.title}</span>
    //         </div>
    //     );
    // }
}
