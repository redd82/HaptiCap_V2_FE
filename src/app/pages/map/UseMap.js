import React, {useCallback, useContext, useEffect, useState, useRef} from 'react';
import { IconContext } from "react-icons";
import { SiArchlinux } from "react-icons/si";
import stylesMap from '../../styles/pages/UseMap.module.css';
import { Box, Button, Paper, Stack } from '@mui/material';
import { useLocation} from "react-router-dom";
import PositionModal from './components/PositionModal';
import MessageModal from './components/MessageModal';
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';
import ImageMarker from "react-image-marker";

export default function UseMap(){
  const {getServerHost, fetchPositionCompassHeading} = useContext(CommsContext);
    const {onLoad, getLatLongFromXY,getXYFromLatLon} = useContext(CalculationContext);
    const location = useLocation();
    const { mapData } = location.state;
    const [enableAddWaypoints, setEnableAddWaypoints] = useState(false);
    const [enableWaypointOptions, setEnableWaypointOptions] = useState(true);
    const [ownPosition, setOwnPosition] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000});
    const [iconPos, setIconPos] = useState({top: 0, left: 0});
    const [showModalOwnPosition, setShowModalOwnPosition] = useState(false);
    const [modalPosition, setModalPosition] = useState({top: 0, left: 0});
    const [noGPSFix, setNoGPSFix] = useState(false);
    const topLeftPosition = useRef(null);

    const [markers, setMarkers] = useState([]);
    const timeDelaySec = 1000;

    const getSizes = useCallback(() => {
      topLeftPosition.current = getMapTopLeftPosition();
    }, []);

    const CustomMarker = (props) => {
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
        topLeftPosition.current = getMapTopLeftPosition();
      }else{
        setEnableAddWaypoints(true);
        topLeftPosition.current = getMapTopLeftPosition();
      }
    }

    const getClickCoords = (event) => {
      const topLeftOfMap = topLeftPosition.current;
        if(event.detail === 1){
          mapData["imageWidth"] = topLeftOfMap.width;
          mapData["imageHeight"] = topLeftOfMap.height;
          let temp = getLatLongFromXY(event.pageX - topLeftOfMap.left, event.pageY - topLeftOfMap.top, mapData);
          console.log("temp: " + temp);
          console.log("getClickCoords; Output: X:" + (event.pageX - topLeftOfMap.left) + " Y:" + (event.pageY - topLeftOfMap.top));
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

        if(XY.x < 0){
          XY.x = 0;
        }

        if(XY.y < 0){
          XY.y = 0;
        }

        setIconPos({top: XY.y, left: XY.x});
        document.documentElement.style.setProperty('--own-pos-icon-rotation', (Math.round((convertIconRotation(data.CompassHeading))) + "deg"));
        document.documentElement.style.setProperty('--own-pos-icon-size', iconSize + "px");
        document.documentElement.style.setProperty('--own-pos-top', (XY.y-10) + "px");
        document.documentElement.style.setProperty('--own-pos-left', (XY.x-3) + "px");
        if(showModalOwnPosition){
          setModalPosition(iconPos);
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
        if(showModalOwnPosition) {
          setShowModalOwnPosition(false);
        }else{
          setModalPosition(iconPos);
          setShowModalOwnPosition(true);
        }
      }

      function toggleWayPointOptions(){
        if(enableWaypointOptions){
          setEnableWaypointOptions(false);
        }else{
          setEnableWaypointOptions(true);
        }
      }

      useEffect( () => {
        onLoad(mapData);
        fetchPositionCompassHeading().then(r => {
          if(r.GPSLat === 0){
            setNoGPSFix(true);
          }else{
            setNoGPSFix(false);
          }
          setOwnPosition(r);
          topLeftPosition.current = getMapTopLeftPosition();
          setOwnPositionIcon(r);
      });
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        fetchPositionCompassHeading().then(r => {
          if(r.GPSLat === 0){
            setNoGPSFix(true);
          }else{
            setNoGPSFix(false);
          }
          setOwnPosition(r);
          setOwnPositionIcon(r);
        });
      }, timeDelaySec);
      return () => {
          clearInterval(interval);
      };
      }, []);

    useEffect(() => {
      window.addEventListener("resize", getSizes, false);
      return () => window.removeEventListener("resize", getSizes, false);
    }, [getSizes]);

    const noGpsModalPosition = topLeftPosition.current
      ? { top: topLeftPosition.current.height / 2, left: topLeftPosition.current.width / 2 }
      : { top: 100, left: 100 };

    return(
      <Box id="useMap" sx={{ position: 'relative' }}>
        {(enableWaypointOptions) ? 
        ( <Paper elevation={2} sx={{ p: 1, mb: 1, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" disabled={!markers.length > 0} onClick={() => setMarkers([])}>
            Clear All
          </Button>
          <Button variant="contained" onClick={toggleAddWayPoints}> 
            {(enableAddWaypoints) ? (
                <>Add waypoints Enabled</>
            ):(
                <>Add waypoints Disabled</>
            )}
            </Button>
          </Stack>
        </Paper>) : (<></>)}

        <Box id="marker" sx={{ position: 'relative' }}>
          <Button
            variant="contained"
            size="small"
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 6 }}
            onClick={toggleWayPointOptions}
          >
            Waypoint Options
          </Button>
          {(enableAddWaypoints) ? (
            <ImageMarker
              src={getServerHost() + mapData.pngFile}
              markers={markers}
              onAddMarker={((marker) => setMarkers((prev) => [...prev, marker]))}
              markerComponent={CustomMarker}
            />
          ) : (
            <div className={stylesMap['map-overlay']} onClick={getClickCoords}>
                <ImageMarker
                  id="marker"
                  src={getServerHost() + mapData.pngFile}
                  markers={markers}
                  markerComponent={CustomMarker}
                />
            </div>
          )}
          </Box>
          <IconContext.Provider value={{ color: "blue", className: "global-class-name", size: "0.4em"}}>
            <div className={stylesMap['own-position-icon-custom']} onClick={clickOwnPos}>
              <SiArchlinux />
            </div>
          </IconContext.Provider>
            {(showModalOwnPosition)? (<PositionModal position={modalPosition} text={[ownPosition.GPSLat, ownPosition.GPSLon]}/>) : (<></>)}
            {(noGPSFix) ? (<MessageModal position={noGpsModalPosition} text={["No GPS FIX"]}/>) : (<></>)}
      </Box>
    );
}