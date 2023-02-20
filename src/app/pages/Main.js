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
import CommsContextProvider from '../contexts/CommsContext';

export default function Main(props){
    const location = useLocation();
    const [espTime, setEspTime] = useState({});
    const [espDate, setEspDate] = useState({});
    const {storeData, fetchSettings, getServerHost, restartHaptiCap, fetchTime, fetchDate} = useContext(CommsContext);
    let tempTime = {GPSTime: ''};
    let timeDelay = 60000;

    useEffect( () => {
        fetchDate().then(r => {
            setEspDate(r);
            console.log(r);
        });
        fetchTime().then(r => {
            tempTime.GPSTime = r.GPSTime;
            setEspTime(r);
            console.log('GPSTime:');
            console.log(tempTime.GPSTime);
        });        
        }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTime().then(r => {
                setEspTime(r);
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
            <Header title="HaptiCap V2" time={espTime.GPSTime} date={espDate.GPSDate}/>
                <Search/>
                    <DateContextProvider>
                        <Menubar/>
                        <Routing/>
                    </DateContextProvider>
             <Footer/>
         </div>
    </>
    );
}