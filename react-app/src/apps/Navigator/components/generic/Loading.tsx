import React from 'react';
import './Loading.css';

interface Props {
  message?: string;
}

export default function LoadingSpinner(props: Props) {
  return (
    <div className="Alert Alert-info Loading">
      <i className="fa fa-gear fa-spin fa-2x"></i>
      <span className="-message">{props.message || 'Loading...'}</span>
    </div>
  );
}
