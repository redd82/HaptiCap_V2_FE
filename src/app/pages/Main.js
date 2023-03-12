import React, {useContext, useEffect, useState} from 'react';
import styles from "../styles/Main.module.css";
import Menubar from "./Menubar";
import Routing from "../router/Routing";
import Search from "./search/Search";
import Footer from "./Footer";
import Header from "./Header";
import DateContextProvider from "../contexts/DateContext";
import {CommsContext} from "../contexts/CommsContext";
import {useLocation} from "react-router-dom";
import MapsContextProvider from '../contexts/MapsContext';
import StoreContextProvider from '../contexts/StoreContext';
import CalculationContextProvider from '../contexts/CalculationContext';

export default function Main(props){
    const location = useLocation();
    const [deviceData, setDeviceData] = useState({deviceName: ""});
    const {fetchDeviceName} = useContext(CommsContext);

    useEffect( () => {
        fetchDeviceName().then(r => {
            setDeviceData(r);
        });    
        }, []);

    return (
        <>
            <div className={styles.main}>
                <Header title={deviceData.deviceName}/>
                    <Search/>
                        <CalculationContextProvider>
                            <StoreContextProvider>
                                <MapsContextProvider>
                                    <DateContextProvider>
                                        <Menubar/>
                                        <Routing/>
                                    </DateContextProvider>
                                </MapsContextProvider>
                            </StoreContextProvider>
                        </CalculationContextProvider>
                    <Footer />
            </div>
        </>
    );
}