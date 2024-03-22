import App from 'components/App';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
// import reportWebVitals from './reportWebVitals';

import 'font-awesome/css/font-awesome.css';

import './antd.css';

// import './bootstrap-custom.scss';
import './scss/bootstrap-custom.scss';

import './css/kb-icons.css';

import './main.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <StrictMode> 
        <App />
    </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
