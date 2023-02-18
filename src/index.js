import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import {BrowserRouter as Router} from "react-router-dom";
import StoreContextProvider from './app/contexts/StoreContext';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <StoreContextProvider>
                <App hostAddress={document.getElementById('root').getAttribute('data-hostaddress')}/>
            </StoreContextProvider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
   
);