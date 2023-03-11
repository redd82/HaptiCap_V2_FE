import React, {useContext} from "react";
import styles from '../styles/Menubar.module.css';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';

export default function Menubar(){
    const navigate = useNavigate();
    const location = useLocation();
    let homeLink = <div/>;
    let navigationLink = <div/>;
    let systemLink = <div/>;

    try {
        
        homeLink = <div className={styles['menu-li']}><NavLink to="/">Home</NavLink></div>;
        
        navigationLink = <div className={styles['menu-li']}><NavLink to="/navigation/map-list">Navigation</NavLink></div>;
        systemLink = <div className={styles['menu-li']}><NavLink to="/system/system-info">System</NavLink></div>;
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
                {navigationLink}
                {systemLink}
            </div>
        </nav>
    );
}