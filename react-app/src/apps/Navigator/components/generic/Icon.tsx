import React, { Component } from 'react';
import IconProvider, { IconInfo, AppTag } from '../../api/IconProvider';
import {Config} from "../../../../types/config";
import {AuthInfo} from "../../../../contexts/Auth";

/**
 * Generates various KBase Narrative icons from input props.
 */

// interface TypeProps {
//   objType: string;
// }

interface AppIconProps {
  authInfo: AuthInfo;
  config: Config;
  appId: string;
  appTag: string;
}

interface TypeIconProps {
  authInfo: AuthInfo;
  config: Config;
  objectType: string;
}

interface TypeIconState {
  iconInfo: IconInfo | null;
}

interface DefaultIconProps {
  cellType: string;
}

// Font-awesome class names for each narrative cell type
enum CellIcons {
  codeCell = 'fa fa-code',
  kbaseApp = 'fa fa-cube',
  markdown = 'fa fa-paragraph',
  widget = 'fa fa-wrench',
  data = 'fa fa-database',
}

/**
 * This renders an icon span for a typed object.
 * @param {TypeProps} props - in this case, just the object type string
 *   (Module.Type, like KBaseGenomes.Genome).
 * @return {JSX}
 */
export class TypeIcon extends Component<TypeIconProps, TypeIconState> {

  constructor(props: TypeIconProps) {
    super(props);
    this.state = {
      iconInfo: null
    }
  }

  // const iconProvider = IconProvider.Instance;
  // const iconInfo = iconProvider.typeIcon(props.objType);
  // return (
  //   <span className="fa-stack fa-lg">
  //     <span
  //       className="fa fa-circle fa-stack-2x"
  //       style={{ color: iconInfo.color }}
  //     />
  //     <span className={`fa fa-inverse fa-stack-1x ${iconInfo.icon}`} />
  //   </span>
  // );

  async componentDidMount() {
    const iconProvider = new IconProvider({
      nmsURL: this.props.config.services.NarrativeMethodStore.url,
      nmsImageURL: this.props.config.services.NarrativeMethodStore.image_url,
      token: this.props.authInfo.token
    });
    const iconInfo = await iconProvider.typeIcon(
        this.props.objectType
    );
    this.setState({
      iconInfo: iconInfo,
    });
  }

  /**
   * If we don't have the icon info yet, just make a little loading spinner "icon".
   *
   * Once it's loaded, either render the image or the icon.
   * @return {JSX}
   */
  render() {
    const iconInfo = this.state.iconInfo
        ? this.state.iconInfo
        : { isImage: false, icon: 'fa fa-spinner', color: 'silver' };

    if (iconInfo.isImage) {
      return (
          <span>
          <img
              height="40"
              src={iconInfo.url}
              style={{ maxWidth: '2.5em', maxHeight: '2.5em', margin: 0 }}
              width="40"
          />
        </span>
      );
    } else {
      return (
          <span className="fa-stack fa-lg">
          <span
              className="fa fa-square fa-stack-2x"
              style={{ color: iconInfo.color }}
          />
          <span className={`fa fa-inverse fa-stack-1x ${iconInfo.icon}`} />
        </span>
      );
    }
  }
}

interface AppIconState {
  iconInfo: IconInfo | null;
}

/**
 * The AppCellIcon is a little more complex here. To avoid it being blank then popping it,
 * it starts by rendering a default icon. Then it asynchronously loads its icon based on the
 * app spec, which gets its info fetched from the IconProvider service.
 *
 * Its props are app id (ModuleName.appName) and tag (release, beta, or dev)
 */
export class AppCellIcon extends Component<AppIconProps, AppIconState> {
  constructor(props: AppIconProps) {
    super(props);
    this.state = {
      iconInfo: null
    }
  }

  /**
   * On mount, ask the icon provider to cough up the info about the app icon
   * so we can render it. This updates the iconInfo state.
   */
  async componentDidMount() {
    const iconProvider = new IconProvider({
      nmsURL: this.props.config.services.NarrativeMethodStore.url,
      nmsImageURL: this.props.config.services.NarrativeMethodStore.image_url,
      token: this.props.authInfo.token
    });
    const iconInfo = await iconProvider.appIcon(
      this.props.appId,
      this.props.appTag as AppTag
    );
    this.setState({
      iconInfo: iconInfo,
    });
  }

  /**
   * If we don't have the icon info yet, just make a little loading spinner "icon".
   *
   * Once it's loaded, either render the image or the icon.
   * @return {JSX}
   */
  render() {
    const iconInfo = this.state.iconInfo
      ? this.state.iconInfo
      : { isImage: false, icon: 'fa fa-spinner', color: 'silver' };

    if (iconInfo.isImage) {
      return (
        <span>
          <img
            height="40"
            src={iconInfo.url}
            style={{ maxWidth: '2.5em', maxHeight: '2.5em', margin: 0 }}
            width="40"
          />
        </span>
      );
    } else {
      return (
        <span className="fa-stack fa-lg">
          <span
            className="fa fa-square fa-stack-2x"
            style={{ color: iconInfo.color }}
          />
          <span className={`fa fa-inverse fa-stack-1x ${iconInfo.icon}`} />
        </span>
      );
    }
  }
}

export function DefaultIcon(props: DefaultIconProps) {
  let icon;
  switch (props.cellType) {
    case 'code':
      icon = CellIcons.codeCell;
      break;
    case 'markdown':
      icon = CellIcons.markdown;
      break;
    case 'data':
      icon = CellIcons.data;
      break;
    case 'app':
      icon = CellIcons.kbaseApp;
      break;
    default:
      icon = CellIcons.widget;
      break;
  }
  return (
    <span className="fa-stack fa-lg">
      <span className="fa fa-square fa-stack-2x" style={{ color: 'silver' }} />
      <span className={`fa fa-inverse fa-stack-1x ${icon}`} />
    </span>
  );
}
