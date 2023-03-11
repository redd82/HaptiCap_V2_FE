import React, { useContext, useEffect } from "react";
import '../styles/Content.module.css';
import { StoreContext } from "../contexts/StoreContext";
import {useLocation} from "react-router-dom";

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