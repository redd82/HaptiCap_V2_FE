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
    const [deviceData, setDeviceData] = useState({deviceName: ""});
    const {storeData, fetchTimeDate, fetchDeviceName} = useContext(CommsContext);
    let tempTime = {GPSTime: '', GPSDate: ''};
    let timeDelay = 60000;

    useEffect( () => {
        fetchTimeDate().then(r => {
            setEspTimeDate(r);
            console.log(r);
        });
        fetchDeviceName().then(r => {
            setDeviceData(r);
            console.log(r);
        });        
        }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimeDate().then(r => {
                setEspTimeDate(r);
                console.log(r);
            });
        }, timeDelay);
        return () => {
            clearInterval(interval);
        };
        }, []);


    return (
    <>
         <div className={styles.main}>
            <Header title={deviceData.deviceName} time={espTimeDate.GPSTime} date={espTimeDate.GPSDate}/>
                <Search/>
                <MapsContextProvider>
                        <DateContextProvider>
                            <Menubar/>
                            <Routing/>
                        </DateContextProvider>
                    </MapsContextProvider>
             <Footer/>
         </div>
    </>
    );
}