import App from 'components/App';
import ReactDOM from 'react-dom/client';
// import reportWebVitals from './reportWebVitals';

import 'font-awesome/css/font-awesome.css';
import React from 'react';
import './antd.css';
import './bootstrap-custom.scss';
import './main.css';

// function forceSlashAfterHash() {
//     const hash = window.location.hash;
//     if (hash[1] && hash[1] != '/') {
//         const newURL = new URL(window.location.href);
//         newURL.hash = `#/${hash.slice(1)}`;
//         window.location.href = newURL.toString();
//     }
// }
// forceSlashAfterHash();
// window.addEventListener('hashchange', forceSlashAfterHash);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
