import React, {useContext, useEffect} from "react";
import StoreContextProvider from "../../contexts/StoreContext";
import {NavLink, Outlet, useLocation} from "react-router-dom";
import styles from '../../styles/Content.module.css';
import SettingsInputForm from "./SettingsInputForm";

export default function System({title}){
    const location = useLocation();
    let debugLink = <div/>;
    let settingsLink = <div/>;
    let calibrationLink = <div/>;

    try {
        debugLink = <div className={styles['sub-menu-li']}><NavLink to="debugform">Debug</NavLink></div>;
        settingsLink = <div className={styles['sub-menu-li']}><NavLink to="settingsform">Settings</NavLink></div>;
        calibrationLink = <div className={styles['sub-menu-li']}><NavLink to="calibrationform">Calibration</NavLink></div>;
    }
    catch (e) {
        console.log("error:")
        console.error(e);
    }


    useEffect( () => {

    }, []);

    return(
        <div>
            <nav className={styles['sub-menu']}>
                <div className={styles['sub-menu-ul']}>
                    {debugLink}
                    {calibrationLink}
                    {settingsLink}                    
                </div>
            </nav>
            <main>
                <div className={styles['outlet-maps']}>
                        <Outlet />
                </div>
            </main>
        </div>
    );
}