import React, {useCallback, useContext, useEffect, useState, useRef} from 'react';
import { IconContext } from "react-icons";
import { SiArchlinux } from "react-icons/si";
import stylesMap from '../../styles/pages/UseMap.module.css';
import { Alert, Box, Button, Paper, Stack } from '@mui/material';
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
    const mapData = location?.state?.mapData;
    const [enableAddWaypoints, setEnableAddWaypoints] = useState(false);
    const [enableWaypointOptions, setEnableWaypointOptions] = useState(true);
    const [ownPosition, setOwnPosition] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000});
    const [iconPos, setIconPos] = useState({top: 0, left: 0});
    const [iconRotation, setIconRotation] = useState(0);
    const [showModalOwnPosition, setShowModalOwnPosition] = useState(false);
    const [modalPosition, setModalPosition] = useState({top: 0, left: 0});
    const [noGPSFix, setNoGPSFix] = useState(false);
    const topLeftPosition = useRef(null);
    const markerRef = useRef(null);
    const latestPositionData = useRef(null);
    const frameRef = useRef(null);
    const renderedIconRef = useRef({top: null, left: null, rotation: null});

    const [markers, setMarkers] = useState([]);
    const timeDelaySec = 1000;
    const iconUpdateDeadbandPx = 0.5;

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
      if(!topLeftOfMap){
        return;
      }
        if(event.detail === 1){
          mapData["imageWidth"] = topLeftOfMap.width;
          mapData["imageHeight"] = topLeftOfMap.height;
          let temp = getLatLongFromXY(event.clientX - topLeftOfMap.left, event.clientY - topLeftOfMap.top, mapData);
          console.log("temp: " + temp);
          console.log("getClickCoords; Output: X:" + (event.clientX - topLeftOfMap.left) + " Y:" + (event.clientY - topLeftOfMap.top));
        }else{
          console.log(event.detail);
        }
      };

      const getMapTopLeftPosition = useCallback(() => {
        const container = markerRef.current;
        if (!container) {
          return null;
        }
        const rect = container.getBoundingClientRect();
        return rect;
      }, []);

      const setOwnPositionIcon = useCallback((data) => {
        latestPositionData.current = data;
        topLeftPosition.current = getMapTopLeftPosition();
        const topLeftOfMap = topLeftPosition.current;
        if (!topLeftOfMap) {
          return;
        }

        let XY = getXYFromLatLon(data.GPSLat, data.GPSLon, mapData, topLeftOfMap.width, topLeftOfMap.height);

        if(XY.x < 0){
          XY.x = 0;
        }

        if(XY.y < 0){
          XY.y = 0;
        }

        if(XY.x > topLeftOfMap.width){
          XY.x = topLeftOfMap.width;
        }

        if(XY.y > topLeftOfMap.height){
          XY.y = topLeftOfMap.height;
        }

        const nextRotation = Math.round(convertIconRotation(data.CompassHeading));
        const previous = renderedIconRef.current;
        const movedEnough =
          previous.top === null ||
          previous.left === null ||
          Math.abs(previous.top - XY.y) >= iconUpdateDeadbandPx ||
          Math.abs(previous.left - XY.x) >= iconUpdateDeadbandPx ||
          previous.rotation !== nextRotation;

        if(movedEnough){
          setIconPos({top: XY.y, left: XY.x});
          setIconRotation(nextRotation);
          renderedIconRef.current = {top: XY.y, left: XY.x, rotation: nextRotation};
        }

        if(showModalOwnPosition){
          setModalPosition({top: XY.y, left: XY.x});
        }
      }, [getMapTopLeftPosition, getXYFromLatLon, mapData, showModalOwnPosition, iconUpdateDeadbandPx]);

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
        if(!mapData){
          return;
        }
        onLoad(mapData);
        fetchPositionCompassHeading().then(r => {
          if(r.GPSLat === 0){
            setNoGPSFix(true);
          }else{
            setNoGPSFix(false);
          }
          setOwnPosition(r);
          setOwnPositionIcon(r);
      });
    }, [fetchPositionCompassHeading, mapData, onLoad, setOwnPositionIcon]);

    useEffect(() => {
      if(!mapData){
        return;
      }
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
      }, [fetchPositionCompassHeading, mapData, setOwnPositionIcon]);

    useEffect(() => {
      if(!mapData || !markerRef.current){
        return;
      }

      topLeftPosition.current = getMapTopLeftPosition();
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(() => {
        topLeftPosition.current = getMapTopLeftPosition();
        if(latestPositionData.current){
          setOwnPositionIcon(latestPositionData.current);
        }
      });

      observer.observe(markerRef.current);

      return () => observer.disconnect();
    }, [mapData, setOwnPositionIcon, getMapTopLeftPosition]);

    useEffect(() => {
      if(!mapData){
        return;
      }

      const requestReposition = () => {
        if(frameRef.current || !latestPositionData.current){
          return;
        }

        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = null;
          setOwnPositionIcon(latestPositionData.current);
        });
      };

      window.addEventListener('scroll', requestReposition, { passive: true });
      window.addEventListener('resize', requestReposition);

      return () => {
        window.removeEventListener('scroll', requestReposition);
        window.removeEventListener('resize', requestReposition);
        if(frameRef.current){
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }, [mapData, setOwnPositionIcon]);

    const noGpsModalPosition = topLeftPosition.current
      ? { top: topLeftPosition.current.height / 2, left: topLeftPosition.current.width / 2 }
      : { top: 100, left: 100 };

    if(!mapData){
      return (
        <Alert severity="error">No map selected. Please go back to Map List and select a map.</Alert>
      );
    }

    if(!mapData.pngFile){
      return (
        <Alert severity="error">Selected map has no image file (pngFile missing).</Alert>
      );
    }

    const mapImageSrc = getServerHost() + mapData.pngFile;

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

        <Box id="marker" ref={markerRef} sx={{ position: 'relative' }}>
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
              src={mapImageSrc}
              markers={markers}
              onAddMarker={((marker) => setMarkers((prev) => [...prev, marker]))}
              markerComponent={CustomMarker}
            />
          ) : (
            <div className={stylesMap['map-overlay']} onClick={getClickCoords}>
                <ImageMarker
                  src={mapImageSrc}
                  markers={markers}
                  markerComponent={CustomMarker}
                />
            </div>
          )}
          <IconContext.Provider value={{ color: "blue", className: "global-class-name", size: "0.4em"}}>
            <div
              className={stylesMap['own-position-icon-custom']}
              style={{
                top: iconPos.top - 10,
                left: iconPos.left - 3,
                transform: `rotate(${iconRotation}deg)`,
              }}
              onClick={clickOwnPos}
            >
              <SiArchlinux />
            </div>
          </IconContext.Provider>
          {(showModalOwnPosition)? (<PositionModal position={modalPosition} text={[ownPosition.GPSLat, ownPosition.GPSLon]}/>) : (<></>)}
          {(noGPSFix) ? (<MessageModal position={noGpsModalPosition} text={["No GPS FIX"]}/>) : (<></>)}
          </Box>
      </Box>
    );
}