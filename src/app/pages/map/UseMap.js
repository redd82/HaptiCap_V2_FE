import React from 'react';
import styles from '../../styles/Content.module.css';
import {useLocation} from "react-router-dom";

export default function UseMap({}){
    const location = useLocation();
    const { mapData } = location.state;
    console.log(mapData);

    return(
        <div>
            <img className={styles['map']} src={mapData.pngFile} useMap='#gridmap' alt=""></img>
        </div>
    );
}