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

export default function Main(props){
    const location = useLocation();
    const [espTimeDate, setEspTimeDate] = useState({});
    const [espGPSPosition, setGPSPosition] = useState({});
    const [deviceData, setDeviceData] = useState({deviceName: ""});
    const {storeData, fetchTimeDate, fetchDeviceName, fetchPosition} = useContext(CommsContext);
    let tempTime = {GPSTime: '', GPSDate: ''};
    let timeDelayMin = 60000;
    let timeDelaySec = 1000;

    useEffect( () => {
        fetchTimeDate().then(r => {
            setEspTimeDate(r);
        });
        fetchDeviceName().then(r => {
            setDeviceData(r);
        });
        fetchPosition().then(r => {
            setGPSPosition(r);
        });        
        }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimeDate().then(r => {
                setEspTimeDate(r);
            });
            fetchPosition().then(r => {
                setGPSPosition(r);
            });
        }, timeDelayMin);
        return () => {
            clearInterval(interval);
        };
        }, []);

        useEffect(() => {
            const interval = setInterval(() => {
                fetchPosition().then(r => {
                    setGPSPosition(r);
                });
            }, timeDelaySec);
            return () => {
                clearInterval(interval);
            };
            }, []);
        

    return (
    <>
         <div className={styles.main}>
            <Header title={deviceData.deviceName}/>
                <Search/>
                    <MapsContextProvider>
                        <DateContextProvider>
                            <Menubar/>
                            <Routing/>
                        </DateContextProvider>
                    </MapsContextProvider>
                <Footer time={espTimeDate.GPSTime} date={espTimeDate.GPSDate} lat={espGPSPosition.GPSLat} lon={espGPSPosition.GPSLon}/>
         </div>
    </>
    );
}