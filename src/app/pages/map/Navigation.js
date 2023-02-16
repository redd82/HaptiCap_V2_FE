import React, {useContext, useEffect} from "react";
import styles from'../../styles/Content.module.css';
import {NavLink, Outlet, useLocation} from "react-router-dom";
import MapsContextProvider from "../../contexts/MapsContext";

export default function Navigation(){
    const location = useLocation();
    let newMapLink = <div/>;
    let waypointsLink = <div/>;

    try {
        newMapLink = <div className={styles['sub-menu-li']}><NavLink to="new-map">Install New map</NavLink></div>;
        waypointsLink = <div className={styles['sub-menu-li']}><NavLink to="waypoints">Waypoints</NavLink></div>;
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
                    {newMapLink}
                    {waypointsLink}
                </div>
            </nav>
            <main>
                <div className={styles['outlet-maps']}>
                    <MapsContextProvider>
                        <Outlet />
                    </MapsContextProvider>
                </div>
            </main>
        </div>
    );
}