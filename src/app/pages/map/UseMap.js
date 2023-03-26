import React, {useContext, useEffect, useState, useRef} from 'react';
import { IconContext } from "react-icons";
import { SiArchlinux } from "react-icons/si";
import styles from '../../styles/Content.module.css';
import stylesMenuBar from '../../styles/Menubar.module.css';
import stylesMap from '../../styles/pages/UseMap.module.css';
import {NavLink, useLocation} from "react-router-dom";
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';
import ImageMarker from "react-image-marker";

export default function UseMap(){
    const {getServerHost, fetchPosition, fetchPositionCompassHeading} = useContext(CommsContext);
    const {onLoad, calculateImageCoords, calculateBoundingBox, convertLatLonToXY} = useContext(CalculationContext);
    const location = useLocation();
    const { mapData } = location.state;
    const [boundingBox, setBoundingBox] = useState({})
    const [ enableAddWaypoints, setEnableAddWaypoints] = useState(false);
    const [ownPosition, setOwnPosition] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000})
    // const [topLeftPosition, setTopLeftPosition] = useState({});
    const topLeftPosition = useRef(null);

    let [markers, setMarkers] = useState([]);
    let timeDelaySec = 1000;
    let ownPosIconTopLeft = ["150px", "0px"]

    window.addEventListener("resize", getSizes, false);
    // let out = document.querySelector(".output");

    function getSizes() {
      // let zoom = ((window.outerWidth - 10)/ window.innerWidth) * 100;
      // console.log(zoom);
      topLeftPosition.current = getMapTopLeftPosition();
    }

    const CustomMarker = (props) => {
      // console.log(props);
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
          //let coordinates = calculateImageCoords(event, boundingBox);
          let e = event.target;
          let dim = e.getBoundingClientRect();
          let x = event.clientX - dim.left;
          let y = event.clientY - dim.top;
          // console.log(dim);
          // console.log(x);
          // console.log(y);
          // console.log(event);
          // //console.log(coordinates);
          // console.log(markers);
        }else{
          console.log(event.detail);
        }
      };

      function getMapTopLeftPosition(){
        const container = document.getElementById("marker");
        const rect = container.getBoundingClientRect();
        return rect;
      }

      function setOwnPositionIcon(data){
        // console.log(data);
        let boundingBox = calculateBoundingBox(mapData.north, mapData.west, mapData.south, mapData.east, mapData.rotation);
        setBoundingBox(boundingBox);
        // console.log("Bounding Box:");
        // console.log(boundingBox);
        // console.log(topLeftPosition.current);
        const topLeftOfMap = topLeftPosition.current;
        //let XY = convertLatLonToXY(52.19087, 4.670616, boundingBox, rect.width, rect.height);
        let XY = convertLatLonToXY(data.GPSLat, data.GPSLon, boundingBox, topLeftOfMap.width, topLeftOfMap.height, topLeftOfMap);
        // console.log(XY);
        let scale = topLeftOfMap.height/mapData.imageHeight;
        let iconSize = Math.round(scale * 25);
        // console.log(scale);
        // console.log(iconSize);
        // console.log((Math.round((convertIconRotation(data.CompassHeading))) + "deg"));
        document.documentElement.style.setProperty('--own-pos-icon-rotation', (Math.round((convertIconRotation(data.CompassHeading))) + "deg"));
        document.documentElement.style.setProperty('--own-pos-icon-size', iconSize + "px");
        document.documentElement.style.setProperty('--own-pos-top', (XY.y-10) + "px");
        document.documentElement.style.setProperty('--own-pos-left', (XY.x-3) + "px");
      }

      function convertIconRotation(heading){
        let rotation = 45;
        if(heading > 180){
          rotation = heading - 360;
        }else{
          rotation = heading;
        }
        // console.log(rotation);
        return rotation;
      }

      useEffect( () => {
        onLoad(mapData);
        fetchPositionCompassHeading().then(r => {
          setOwnPosition(r);
          topLeftPosition.current = getMapTopLeftPosition();
          setOwnPositionIcon(r)
      });
        
        // console.log(mapData);
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        fetchPositionCompassHeading().then(r => {
            setOwnPosition(r);
            setOwnPositionIcon(r)
        });
      }, timeDelaySec);
      return () => {
          clearInterval(interval);
      };
      }, []);

    return(
      <div id="useMap">
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
        {/* <img id="marker" className={styles['map']} src={getServerHost() + mapData.pngFile} alt="" onClick={getClickCoords}></img> */}
        <div id="marker">
          {(enableAddWaypoints) ? (
            <ImageMarker
              src={getServerHost() + mapData.pngFile}
              markers={markers}
              onAddMarker={((marker) => setMarkers((prev) => [...prev, marker]))}
              markerComponent={CustomMarker}
            />
          ) : (
            <div  className={stylesMap['map']}>
            <ImageMarker
              id="marker"
              src={getServerHost() + mapData.pngFile}
              markers={markers}
              markerComponent={CustomMarker}
            />
            </div>
          )}
          </div>
          <IconContext.Provider value={{ color: "blue", className: "global-class-name", size: "0.4em"}}>
            <div className={stylesMap['own-position-icon-custom']}>
              <SiArchlinux />
            </div>
          </IconContext.Provider>
          {/* <div className={stylesMap['own-position-icon']}/> */}
      </div>

    );
}