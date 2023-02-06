import React, {useContext, useEffect} from "react";
import styles from'../../styles/Content.module.css';
import {NavLink, Outlet, useLocation} from "react-router-dom";
import MapsContextProvider from "../../contexts/MapsContext";

export default function Maps(){
    const location = useLocation();
    let newMapLink = <div/>;
    let selectMapLink = <div/>;

    try {
        newMapLink = <li><NavLink to="new-map">New map</NavLink></li>;
        selectMapLink = <li><NavLink to="map-list">Map List</NavLink></li>;
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
                <ul>
                    {newMapLink}
                    {selectMapLink}
                </ul>
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