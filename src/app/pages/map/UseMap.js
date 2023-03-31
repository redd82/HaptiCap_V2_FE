import React, {useContext, useEffect, useState, useRef} from 'react';
import { IconContext } from "react-icons";
import { SiArchlinux } from "react-icons/si";
import styles from '../../styles/Content.module.css';
import stylesMenuBar from '../../styles/Menubar.module.css';
import stylesMap from '../../styles/pages/UseMap.module.css';
import {NavLink, useLocation} from "react-router-dom";
import PositionModal from './components/PositionModal';
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';
import ImageMarker from "react-image-marker";

export default function UseMap(){
    const {getServerHost, fetchPosition, fetchPositionCompassHeading} = useContext(CommsContext);
    const {onLoad, calculateImageCoords, getLatLongFromXY,getXYFromLatLon} = useContext(CalculationContext);
    const location = useLocation();
    const { mapData } = location.state;
    const [boundingBox, setBoundingBox] = useState({})
    const [enableAddWaypoints, setEnableAddWaypoints] = useState(false);
    const [ownPosition, setOwnPosition] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000});
    const [iconPos, setIconPos] = useState({top: 0, left: 0});
    const [showModal, setShowModal] = useState(false);
    const [modalPosition, setModalPosition] = useState({top: 0, left: 0});
    const [modalHTML, setModalHTML] = useState(<></>);

    // const [topLeftPosition, setTopLeftPosition] = useState({});
    const topLeftPosition = useRef(null);

    let [markers, setMarkers] = useState([]);
    let timeDelaySec = 1000;
    let ownPosIconTopLeft = ["150px", "0px"]

    window.addEventListener("resize", getSizes, false);

    function getSizes() {
      topLeftPosition.current = getMapTopLeftPosition();
    }

    const CustomMarker = (props) => {
      // console.log(props);
        return (
          <div
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
      const topLeftOfMap = topLeftPosition.current;
      console.log(topLeftOfMap);
        if(event.detail === 1){
          console.log(event);
          let x = event.clientX - topLeftOfMap.left;
          let y = event.clientY - topLeftOfMap.top;
          console.log(x);
          console.log(y);
          let temp = [0,0];
          temp = getLatLongFromXY(x, y, mapData);
          console.log("temp: " + temp);
          console.log("getClickCoords; Output: X:" + x + " Y:" + y);
					// <latitude>52.19112854086129</latitude>
          // <longitude>4.671433079944491</longitude>
          // 52.19201003,4.67096507

          // Latitude: 52.19302302
          // Longitude: 4.67769684

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
        const topLeftOfMap = topLeftPosition.current;
        let XY = getXYFromLatLon(data.GPSLat, data.GPSLon, mapData, topLeftOfMap.width, topLeftOfMap.height, topLeftOfMap);
        let scale = topLeftOfMap.height/mapData.imageHeight;
        let iconSize = Math.round(scale * 25);
        setIconPos({top: XY.y, left: XY.x});
        document.documentElement.style.setProperty('--own-pos-icon-rotation', (Math.round((convertIconRotation(data.CompassHeading))) + "deg"));
        document.documentElement.style.setProperty('--own-pos-icon-size', iconSize + "px");
        document.documentElement.style.setProperty('--own-pos-top', (XY.y-10) + "px");
        document.documentElement.style.setProperty('--own-pos-left', (XY.x-3) + "px");
        if(showModal){
          setModalPosition(iconPos);
          setModalHTML([ownPosition.GPSLat, ownPosition.GPSLon]);
        }
      }

      function convertIconRotation(heading){
        let rotation = 45;
        if(heading > 180){
          rotation = heading - 360;
        }else{
          rotation = heading;
        }
        return rotation;
      }

      function clickOwnPos(){
        console.log('click');
        if(showModal) {
          setShowModal(false);
        }else{
          setModalPosition(iconPos);
          setModalHTML([ownPosition.GPSLat, ownPosition.GPSLon]);
          setShowModal(true);
        }
      }

      function setModal(position, html,enable){
        setModalPosition(iconPos);
        setModalHTML([ownPosition.GPSLat, ownPosition.GPSLon]);
        setShowModal(true);
      }

      useEffect( () => {
        onLoad(mapData);
        fetchPositionCompassHeading().then(r => {
          setOwnPosition(r);
          topLeftPosition.current = getMapTopLeftPosition();
          setOwnPositionIcon(r)
      });
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
        <div id="marker">
        <img className={stylesMap['map']} src={getServerHost() + mapData.pngFile} alt="" onClick={getClickCoords}></img>
          {/* {(enableAddWaypoints) ? (
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
          )} */}
          </div>
          <IconContext.Provider value={{ color: "blue", className: "global-class-name", size: "0.4em"}}>
            <div className={stylesMap['own-position-icon-custom']} onClick={clickOwnPos}>
              <SiArchlinux />
            </div>
          </IconContext.Provider>
            {(showModal)? (<PositionModal position={modalPosition} text={[ownPosition.GPSLat, ownPosition.GPSLon]}/>) : (<></>)}
      </div>
    );
}