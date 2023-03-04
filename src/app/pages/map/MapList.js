import React, {useContext, useEffect, useState} from "react";
import styles from '../../styles/Content.module.css';
import stylesSearchBar from "../../styles/components/SearchBar.module.css";
import MapData from "./components/MapData"
import SubHeader from "../components/SubHeader";
import {MapsContext} from "../../contexts/MapsContext";
import {UtilityContext} from "../../contexts/UtilityContext";

export default function MapList({title}){
    const {fetchMapList} = useContext(MapsContext);
    const {sortData} = useContext(UtilityContext);
    const [mapList, setMapList] = useState([{id: 1, name: "Home", country: "Netherlands", area: "Kaag en Braassem", pngFile:"/Home.png", kmlFile:"/Home.kml"}]);
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        //fetchMapList().then(r => setMapList(sortData(r)));
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data...</div>
    }

    if(!mapList || mapList.length === 0){
        return <p>No Maps</p>
    }

    return(
        <>
            <div className={stylesSearchBar['search-bar']}>
                <label className={stylesSearchBar['search-label']} htmlFor="search">Country:</label>
                <input
                    type="text"
                    name="search"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                />
            </div>

            <SubHeader title={title} nrOfRecords={mapList.length}/>
            <table className={styles['standard-table']}>
                <thead>
                    <tr>
                    <th className={styles['standard-th']}>id</th>
                    <th className={styles['standard-th']}>Name</th>
                    <th className={styles['standard-th']}>Country</th>
                    <th className={styles['standard-th']}>Area</th>
                    </tr>
                </thead>
                {mapList
                    .filter(map => map.country.match(new RegExp(searchValue, "i")))
                    .map((map) => (
                    <React.Fragment key={map.id}>
                            <MapData id={map.id} map={map}/>
                    </React.Fragment>
                ))}
            </table>
        </>
    );
}