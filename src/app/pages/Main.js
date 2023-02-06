import React, {useContext, useEffect, useState} from 'react';
import styles from "../styles/Main.module.css";
import Menubar from "./Menubar";
import Routing from "../router/Routing";
import Search from "./search/Search";
import Footer from "./Footer";
import Header from "./Header";
import DateContextProvider from "../contexts/DateContext";
import {useLocation} from "react-router-dom";

export default function Main(){
    const location = useLocation();
    // const [ openedPage, setOpenedPage ] = useState('');
    useEffect( () => {

        }, []);

    return (
    <>
         <div className={styles.main}>
            <Header title="HaptiCap V2"/>
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