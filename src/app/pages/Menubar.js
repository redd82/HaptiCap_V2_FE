import React, {useContext} from "react";
import styles from '../styles/Menubar.module.css';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';

export default function Menubar(){
    const navigate = useNavigate();
    const location = useLocation();
    let homeLink = <div/>;
    let mapLink = <div/>;
    let settingsLink = <div/>;

    try {
        homeLink = <div className={styles['menu-li']}><NavLink to="/">Home</NavLink></div>;
        mapLink = <div className={styles['menu-li']}><NavLink to="/maps/map-list">Maps</NavLink></div>;
        settingsLink = <div className={styles['menu-li']}><NavLink to="/settings">Settings</NavLink></div>;
    }
    catch (e) {
        console.log("error:")
        console.error(e);
        setTimeout(() => navigate('/'), 1);
    }

    return(
        <nav className={styles.menubar}>
            <div className={styles['menu-ul']}>
                {homeLink}
                {mapLink}
                {settingsLink}
            </div>
        </nav>
    );
}