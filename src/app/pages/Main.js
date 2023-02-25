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

export default function Main(props){
    const location = useLocation();
    const [espTimeDate, setEspTimeDate] = useState({});
    const {storeData, fetchTimeDate} = useContext(CommsContext);
    let tempTime = {GPSTime: '', GPSDate: ''};
    let timeDelay = 60000;

    useEffect( () => {
        fetchTimeDate().then(r => {
            setEspTimeDate(r);
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
            <Header title="HaptiCap V2" time={espTimeDate.GPSTime} date={espTimeDate.GPSDate}/>
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