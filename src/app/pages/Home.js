import React, { useContext, useEffect } from "react";
import styles from'../styles/Content.module.css';
import { StoreContext } from "../contexts/StoreContext";
import MapsContextProvider from "../contexts/MapsContext";
import {NavLink, Outlet, useLocation} from "react-router-dom";


export default function Home({title}){
    const {getLoadedMapData} = useContext(StoreContext);
    // const location = useLocation();
    // const { mapData } = location.state;

    useEffect( () => {
        console.log(getLoadedMapData()); 
        }, []);

    return(
        <>
            {(getLoadedMapData()) ? (                
                <div>
                <main>
                    <div className={styles['outlet-maps']}>
                        <MapsContextProvider>
                            <Outlet />
                        </MapsContextProvider>
                    </div>
                </main>
            </div>
            ) : (
                <article>
                    <header>
                        <h1>Introduction</h1>
                    </header>
                <section>
                    <article>
                        Starting page for ESP32 HaptiCap V2
                    </article>
                </section>
                </article>
            )}
        </>
    );

}