import React, {useContext, useEffect, useState} from 'react';
import styles from '../../styles/Content.module.css';
import {useLocation} from "react-router-dom";
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';

// info:
//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy


export default function UseMap(){
    const {getServerHost} = useContext(CommsContext);
    const {onLoad, getLatLongFromXY} = useContext(CalculationContext);
    const location = useLocation();
    const { mapData } = location.state;

    const getClickCoords = (event) => {
        let e = event.target;
        let dim = e.getBoundingClientRect();
        let x = event.clientX - dim.left;
        let y = event.clientY - dim.top;
        let temp = [0,0];
        temp = getLatLongFromXY(x, y,mapData);
        console.log("temp: " + temp);
        console.log("getClickCoords; Output: X:" + x + " Y:" + y);
        let coordinates = [0,0,0,0];
        coordinates[0] = x;
        coordinates[1] = y;
        coordinates[2] = temp[0];
        coordinates[3] = temp[1];
        return coordinates; 
      };

      useEffect( () => {
        onLoad(mapData);
        console.log(mapData);
    }, []);


    return(
        <div>
            <img className={styles['map']} src={getServerHost() + mapData.pngFile} alt="" onClick={getClickCoords}></img>
        </div>
    );
}