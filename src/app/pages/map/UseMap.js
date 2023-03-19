import React, {useContext, useEffect, useState} from 'react';
import styles from '../../styles/Content.module.css';
import {useLocation} from "react-router-dom";
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';
import ImageMarker from "react-image-marker";
// info:
//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy

export default function UseMap(){
    const {getServerHost} = useContext(CommsContext);
    const {onLoad, getLatLongFromXY} = useContext(CalculationContext);
    const location = useLocation();
    const { mapData } = location.state;
    let [markers, setMarkers] = useState([]);

    const CustomMarker = () => {
        return (
          <div
            className="image-marker__marker image-marker__marker--small"
            data-testid="marker" onClick={getClickCoords}
          ></div>
        );
      };

    const getClickCoords = (event) => {
        let e = event.target;
        let dim = e.getBoundingClientRect();
        let x = event.clientX - dim.left;
        let y = event.clientY - dim.top;
        let xOffset = x - (mapData.imageWidth/2);
        let yOffset = (mapData.imageHeight/2) - y;
        let temp = [0,0];
        temp = getLatLongFromXY(xOffset, yOffset, mapData);
        console.log("temp: " + temp);
        console.log("getClickCoords; Output: X:" + x + " Y:" + y);
        let coordinates = [0,0,0,0];
        coordinates[0] = x;
        coordinates[1] = y;
        coordinates[2] = temp[0];
        coordinates[3] = temp[1];


        return coordinates; 
      };

      async function saveChangesSelectedMap(){

    }

      useEffect( () => {
        onLoad(mapData);
        console.log(mapData);
    }, []);


    return(
        <div>
            <button className={styles['reset-marker-button']} disabled={!markers.length > 0} onClick={() => setMarkers((prev) => prev.slice(0, -1))}> Remove Marker </button>
            {/* <img className={styles['map']} src={getServerHost() + mapData.pngFile} alt="" onClick={getClickCoords}></img> */}
            <ImageMarker
                src={getServerHost() + mapData.pngFile}
                markers={markers}
                onAddMarker={(marker) => setMarkers((prev) => [...prev, marker])}
                markerComponent={CustomMarker}
            />
        </div>
    );
}