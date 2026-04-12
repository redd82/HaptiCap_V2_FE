import React, { useContext, useEffect, useState } from "react";
import styles from'../styles/Content.module.css';
import { StoreContext } from "../contexts/StoreContext";
import MapsContextProvider from "../contexts/MapsContext";
import {NavLink, Outlet, useLocation, useNavigate} from "react-router-dom";
import UseMap from "./map/UseMap";


export default function Home({title}){
    const {getLoadedMapData} = useContext(StoreContext);
    const [ mapData, setMapData ] = useState({});
    const navigate = useNavigate();
    // const location = useLocation();
    //const { mapData } = location.state;

    useEffect( () => {
        setMapData(getLoadedMapData());
        console.log(getLoadedMapData()); 
        if(getLoadedMapData()){
            navigate("../use-map", { state: { mapData } });
        }
        }, []);

    return(
        <>
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
        </>
    );
}