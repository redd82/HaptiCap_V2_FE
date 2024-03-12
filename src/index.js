import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';

import {BrowserRouter as Router} from "react-router-dom";
import StoreContextProvider from './app/contexts/StoreContext';
import CommsContextProvider from './app/contexts/CommsContext';


const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <Router>
            <StoreContextProvider>
                <CommsContextProvider>
                    {/* <Geiger> */}
                        <App hostAddress={document.getElementById('root').getAttribute('data-hostaddress')}/>
                    {/* </Geiger> */}
                </CommsContextProvider>
            </StoreContextProvider>
        </Router>
    </React.StrictMode>
);