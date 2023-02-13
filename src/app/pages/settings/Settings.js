import React, {useContext, useEffect} from "react";
import StoreContextProvider from "../../contexts/StoreContext";
import {NavLink, Outlet, useLocation} from "react-router-dom";
import styles from '../../styles/Content.module.css';
import SettingsInputForm from "./SettingsInputForm";

export default function Settings({title}){
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
                    {settingsLink}
                    {calibrationLink}
                </div>
            </nav>
            <main>
                <div className={styles['outlet-maps']}>
                    <StoreContextProvider>
                        <Outlet />
                    </StoreContextProvider>
                </div>
            </main>
        </div>
    );
}