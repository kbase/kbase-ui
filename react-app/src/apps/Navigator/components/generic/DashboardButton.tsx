// as of now eslint cannot detect when imported interfaces are used
import React, { CSSProperties } from 'react'; // eslint-disable-line no-unused-vars

type DashboardButtonProps = {
  bgcolor?: string;
  textcolor?: string;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

function DashboardButton(props: DashboardButtonProps) {
  const styling: CSSProperties = {
    backgroundColor: props.bgcolor,
    color: props.textcolor,
    border: '1px solid #ccc',
  };
  let classes = 'dib pa2 br2 dib mh1';
  if (!props.disabled) {
    classes += ' pointer dim';
  } else {
    styling.cursor = 'not-allowed';
  }
  return (
    <button className={classes} style={styling} {...props}>
      {props.children}
    </button>
  );
}

export default DashboardButton;
