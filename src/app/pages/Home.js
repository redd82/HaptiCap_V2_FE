import React, { useContext, useEffect } from "react";
import { StoreContext } from "../contexts/StoreContext";
import { useNavigate } from "react-router-dom";
import { MapsContext } from "../contexts/MapsContext";


export default function Home({title}){
    const { getLoadedMapData, setHomeToUseMap } = useContext(StoreContext);
    const { fetchMapList } = useContext(MapsContext);
    const navigate = useNavigate();

    useEffect( () => {
        let active = true;

        async function openFirstMap() {
            const loadedMapData = getLoadedMapData();
            if (loadedMapData && loadedMapData.pngFile) {
                navigate("/navigation/use-map", { state: { mapData: loadedMapData }, replace: true });
                return;
            }

            const response = await fetchMapList();
            if (!active) {
                return;
            }

            const mapList = response?.data?.maps || [];
            const firstMap = mapList.find((map) => map && map.pngFile && map.name !== "Click here to add map");

            if (firstMap) {
                setHomeToUseMap(firstMap);
                navigate("/navigation/use-map", { state: { mapData: firstMap }, replace: true });
            }
        }

        openFirstMap();

        return () => {
            active = false;
        };
    }, [fetchMapList, getLoadedMapData, navigate, setHomeToUseMap]);

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