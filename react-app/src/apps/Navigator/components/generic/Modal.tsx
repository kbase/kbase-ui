// as of now eslint cannot detect when imported interfaces are used
import React, { Component, CSSProperties } from 'react'; // eslint-disable-line no-unused-vars
import { createPortal } from 'react-dom';

interface Props {
  closeFn: () => void;
  title?: string;
  withCloseButton?: boolean;
}

interface State {
  open: boolean;
}

export default class Modal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { open: true };
  }

  render() {
    const backdropStyle: CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      zIndex: 10,
    };

    const outerModalStyle: CSSProperties = {
      boxSizing: 'border-box',
      backgroundColor: 'white',
      borderRadius: '0.25rem',
      minHeight: '10rem',
      minWidth: '30rem',
      maxWidth: '80%',
      maxHeight: '80%',
      overflowY: 'auto',
      border: '1px solid rgba(0, 0, 0, 0.5)',
      top: '15%',
      position: 'absolute',
    };

    const headerStyle: CSSProperties = {
      borderBottom: '1px solid #ccc',
      padding: '0.5rem',
      fontWeight: 'bold',
      display: 'flex',
      flexFlow: 'row nowrap',
    };

    const bodyStyle = {
      margin: '0 auto',
      padding: '3rem',
    };

    let closeButton = null;
    if (this.props.withCloseButton) {
      closeButton = (
        <span
          className={'fa fa-times black-30 dim pointer'}
          onClick={this.props.closeFn}
        ></span>
      );
    }
    let header = null;
    if (this.props.title || this.props.withCloseButton) {
      header = (
        <div style={headerStyle}>
          <div>{this.props.title}</div>
          <div style={{ marginLeft: 'auto' }}>{closeButton}</div>
        </div>
      );
    }

    const modal = (
      <div onClick={this.props.closeFn} className="" style={backdropStyle}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white br2 w"
          style={outerModalStyle}
        >
          {header}
          <div style={bodyStyle}>{this.props.children}</div>
        </div>
      </div>
    );
    return this.state.open ? createPortal(modal, document.body) : null;
  }
}
