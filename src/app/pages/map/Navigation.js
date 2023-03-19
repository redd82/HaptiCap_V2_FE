import React, {useContext, useEffect} from "react";
import styles from'../../styles/Content.module.css';
import {NavLink, Outlet, useLocation} from "react-router-dom";
import MapsContextProvider from "../../contexts/MapsContext";

export default function Navigation(){
    useEffect( () => {

    }, []);

    return(
        <div>
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