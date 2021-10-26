import React, { Component } from 'react';
// import { findDOMNode } from 'react-dom';
import Modal from '../../generic/Modal';
import DeleteNarrative from './DeleteNarrative';
import CopyItem from './CopyItem';
import LinkOrgItem from './LinkOrgItem';
import RenameItem from './RenameItem';
import SharingItem from './sharing/SharingItem';
import { Doc } from '../../../utils/NarrativeModel';
import {AuthContext, AuthenticationStatus, AuthInfo} from '../../../../../contexts/Auth';
import {RuntimeContext} from "../../../../../contexts/RuntimeContext";
import {Config} from "../../../../../types/config";
import { Dropdown } from 'react-bootstrap';
import './ControlMenu.css';

interface State {
  // showMenu: boolean;
  showModal: boolean;
  modalItem: MenuItem | null;
}

interface MenuItem {
  title: string;
  icon: string;
  dialogTitle?: string;
  menuComponent: React.ComponentType<ControlMenuItemProps>;
}

export interface ControlMenuItemProps {
  // authInfo: AuthInfo;
  authInfo: AuthInfo;
  config: Config;
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
}

// const menuItems: Array<MenuItem> = [
//   {
//     title: 'Manage Sharing',
//     icon: 'fa fa-share-alt',
//     dialogTitle: 'Manage Sharing',
//     menuComponent: SharingItem,
//   },
//   {
//     title: 'Copy this Narrative',
//     icon: 'fa fa-copy',
//     dialogTitle: 'Make a Copy',
//     menuComponent: CopyItem,
//   },
//   {
//     title: 'Rename',
//     icon: 'fa fa-paragraph',
//     dialogTitle: 'Rename Narrative',
//     menuComponent: RenameItem,
//   },
//   {
//     title: 'Link to Organization',
//     icon: 'fa fa-users',
//     dialogTitle: 'Link to Organization',
//     menuComponent: LinkOrgItem,
//   },
//   {
//     title: 'Delete',
//     icon: 'fa fa-trash-o',
//     dialogTitle: 'Delete Narrative?',
//     menuComponent: DeleteNarrative,
//   },
// ];

interface ControlMenuProps {
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
}

export default class ControlMenu extends Component<ControlMenuProps, State> {
  constructor(props: ControlMenuProps) {
    super(props);
    this.state = {
      // showMenu: false,
      showModal: false,
      modalItem: null,
    };

    // this.toggleMenu = this.toggleMenu.bind(this);
  }

  componentDidMount() {
    // window.addEventListener('click', this.toggleMenu);
  }

  componentWillUnmount() {
    // window.removeEventListener('click', this.toggleMenu);
  }

  toggleMenu(e: any) {
    // const menuElem = findDOMNode(this); // eslint-disable-line react/no-find-dom-node
    // if (
    //   e.target !== menuElem &&
    //   !menuElem?.contains(e.target) &&
    //   this.state.showMenu
    // ) {
    //   this.hideMenu();
    // }
  }

  menuClicked() {
    // this.setState((prevState) => ({ showMenu: !prevState.showMenu }));
  }

  hideMenu() {
    // this.setState({ showMenu: false });
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  menuItemClicked(item: MenuItem) {
    this.setState({
      // showMenu: false,
      showModal: true,
      modalItem: item,
    });
  }

  renderIcon(icon: string) {
    return  <div className="navbar-icon">
      <span className={`fa fa-${icon}`}></span>
    </div>
  }

  renderMenu() {
    return <Dropdown>
        <Dropdown.Toggle variant="default">
          <span className="fa fa-cog fa-2x"></span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            {this.renderIcon('share-alt')}
            <span>Manage Sharing</span>
          </Dropdown.Item>
          <Dropdown.Item>
            {this.renderIcon('files-o')}
            <span>Copy this Narrative</span>
          </Dropdown.Item>
          <Dropdown.Item>
            {this.renderIcon('paragraph')}
            <span>Rename</span>
          </Dropdown.Item>
          <Dropdown.Item>
            {this.renderIcon('users')}
            <span>Link to Organization</span>
          </Dropdown.Item>
          <Dropdown.Item>
            {this.renderIcon('trash')}
            <span>Delete</span>
          </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
  }

  render() {
    let menu = null;
    menu = this.renderMenu();
    // if (this.state.showMenu) {
    //   // menu = (
    //   //   <div
    //   //     className=""
    //   //   >
    //   //     {menuItems.map((item, idx) => this.menuItem(item, idx))}
    //   //   </div>
    //   // );
    //   menu = this.renderMenu();
    // }

    const modal = ((state) => {
      if (!state.showModal) {
        return null;
      }
      if (!state.modalItem) {
        return null;
      }
      const { dialogTitle, menuComponent } = state.modalItem;
      return (
        <Modal
          closeFn={() => this.closeModal()}
          title={dialogTitle}
          withCloseButton={true}
        >
          <RuntimeContext.Consumer>
            {(value) => {
              if (value === null) {
                return null
              }
              const {authState, config} = value;


            if (authState.status !== AuthenticationStatus.AUTHENTICATED) {
              return null;
            }
             return React.createElement(menuComponent, {
              authInfo: authState.authInfo,
              config,
              narrative: this.props.narrative,
              cancelFn: () => this.closeModal(),
               doneFn: () => this.props.doneFn
                });
            }}
          </RuntimeContext.Consumer>
        </Modal>
      );
    })(this.state);

    return (
      <div className="ControlMenu">
        {/*<span*/}
        {/*  className="fa fa-cog"*/}
        {/*  style={{ cursor: 'pointer' }}*/}
        {/*  onClick={(e) => this.menuClicked()}*/}
        {/*></span>*/}
        {menu}
        {modal}
      </div>
    );
  }

  menuItem(item: MenuItem, idx: number) {
    return (
      <div
        key={item.title}
        style={{ flexFlow: 'row nowrap', cursor: 'pointer' }}
        onClick={(e) => {
          this.menuItemClicked(item);
        }}
      >
        <span className={`${item.icon} w-10 blue`} />
        <span className="ml2">{item.title}</span>
      </div>
    );
  }
}
