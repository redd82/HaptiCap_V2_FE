import React, {useContext, useEffect, useState, useRef} from 'react';
import styles from '../../styles/Content.module.css';
import stylesMenuBar from '../../styles/Menubar.module.css';
import stylesMap from '../../styles/pages/UseMap.module.css';
import {NavLink, useLocation} from "react-router-dom";
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';
import ImageMarker from "react-image-marker";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// info:
//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy

export default function UseMap(){
    const {getServerHost} = useContext(CommsContext);
    const {onLoad, calculateImageCoords} = useContext(CalculationContext);
    const location = useLocation();
    const { mapData } = location.state;
    let [markers, setMarkers] = useState([]);
    const [ enableAddWaypoints, setEnableAddWaypoints] = useState(false);

    const CustomMarker = (props) => {
        return (
          <div
            // className="image-marker__marker image-marker__marker--default"
            className={stylesMap['image-marking-small']}
            data-testid={props.itemNumber} 
            onClick={getClickCoords}
          >
            {props.itemNumber + 1}
          </div>
        );
      };

    function toggleAddWayPoints(){
      if(enableAddWaypoints){
        setEnableAddWaypoints(false);
      }else{
        setEnableAddWaypoints(true);
      }
    }

    const getClickCoords = (event) => {
        if(event.detail === 1){
          calculateImageCoords(event);
          console.log(event);
          console.log(event.detail);
          console.log(markers);
        }else{
          console.log(event.detail);
        }
      };

      useEffect( () => {
        onLoad(mapData);
        console.log(mapData);
    }, []);

    return(
      <div>
        <nav className={stylesMap['buttons']}>
            <button className={stylesMap['marker-button']} disabled={!markers.length > 0} onClick={() => setMarkers([])}> Clear All </button>
            <button className={stylesMap['marker-button']} onClick={toggleAddWayPoints}> 
            {(enableAddWaypoints) ? (
                <>Add waypoints Enabled</>
            ):(
                <>Add waypoints Disabled</>
            )}
            </button>
        </nav>
          {(enableAddWaypoints) ? (
            <ImageMarker
              src={getServerHost() + mapData.pngFile}
              markers={markers}
              onAddMarker={((marker) => setMarkers((prev) => [...prev, marker]))}
              markerComponent={CustomMarker}
            />
          ) : (
            <ImageMarker
              src={getServerHost() + mapData.pngFile}
              markers={markers}
              markerComponent={CustomMarker}
            />
          )}
      </div>
    );
}