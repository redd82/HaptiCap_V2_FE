import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import styles from '../../styles/pages/InputForm.module.css';
import {CommsContext} from "../../contexts/CommsContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function SystemForm({}) {
    const [time, setTime] = useState(Date.now());
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchSensorData, getServerHost, setHome} = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [sensorData, setSensorData ] = useState({magBiasX:""});
    let newFaultTemp = {};
    let timeDelay = 1000;

    const handleButton = (event) => {
        console.log(event);
        if (event === "setHome") {
            setHome();
        }
    }

    useEffect( () => {
        const interval = setInterval(() => {
            fetchSensorData().then(r => {
                setSensorData(r);
                console.log(r);
            });
        }, timeDelay);
        setLoading(false);
        return () => {
            clearInterval(interval);
        };
      }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }


    // SensorDataDoc["sensor"] = "gps";
    // SensorDataDoc["time"] = sensorData.gpsTime;
    // SensorDataDoc["ownLat"] = sensorData.ownLat;  
    // SensorDataDoc["ownLon"] = sensorData.ownLon;
    // SensorDataDoc["homeBaseLat"] = sensorData.homeBaseLat;
    // SensorDataDoc["homeBaseLon"] = sensorData.homeBaseLon;
    // SensorDataDoc["homeBaseBearing"] = sensorData.homeBaseBearing;
    // SensorDataDoc["homebaseCardinal"] = sensorData.homebaseCardinal;
    // SensorDataDoc["homeBaseDistance"] = sensorData.homeBaseDistance;
    // SensorDataDoc["wayPointBearing"] = sensorData.wayPointBearing;
    // SensorDataDoc["waypointCardinal"] = sensorData.waypointCardinal;
    // SensorDataDoc["compassHeading"] = sensorData.compassHeading;
    // SensorDataDoc["compassCardinal"] = sensorData.compassCardinal;
    // SensorDataDoc["nrOfSatellites"] = sensorData.nrOfSatellites;

    return (
        <form className={styles['info-form']} >
            <label className={styles['info-label']} htmlFor="nrOfSatellites">Number of Sats.:</label>
            <input className={styles['ROdata']} name="nrOfSatellites" type="text" id="nrOfSatellites" defaultValue={sensorData.nrOfSatellites} disabled/>

            <label className={styles['info-label']} htmlFor="currentPositionLat">Current Position Lat:</label>
            <input className={styles['ROdata']} name="currentPositionLat" type="text" id="currentPositionLat" defaultValue={sensorData.ownLat} disabled/>

            <label className={styles['info-label']} htmlFor="currentPositionLon">Current Position Lon:</label>
            <input className={styles['ROdata']} name="currentPositionLon" type="text" id="currentPositionLon" defaultValue={sensorData.ownLon} disabled/>

            <label className={styles['info-label']} htmlFor="compassHeading">Compass Heading:</label>
            <input className={styles['ROdata']} name="compassHeading" type="text" id="compassHeading" defaultValue={sensorData.compassHeading} disabled/>

            <label className={styles['info-label']} htmlFor="compassCardinal">Compass Cardinal Heading:</label>
            <input className={styles['ROdata']} name="compassCardinal" type="text" id="compassCardinal" defaultValue={sensorData.compassCardinal} disabled/>  

            <label className={styles['info-label']} htmlFor="homebaseLat">Homebase Lat:</label>
            <input className={styles['ROdata']} name="homebaseLat" type="text" id="homebaseLat" defaultValue={sensorData.homeBaseLat} disabled/>

            <label className={styles['info-label']} htmlFor="homebaseLon">Homebase Lon:</label>
            <input className={styles['ROdata']} name="homebaseLon" type="text" id="homebaseLon" defaultValue={sensorData.homeBaseLon} disabled/>

            <label className={styles['info-label']} htmlFor="homeBaseBearing">Homebase Bearing:</label>
            <input className={styles['ROdata']} name="homeBaseBearing" type="text" id="homeBaseBearing" defaultValue={sensorData.homeBaseBearing} disabled/>

            <label className={styles['info-label']} htmlFor="homebaseCardinal">Homebase Direction:</label>
            <input className={styles['ROdata']} name="homebaseCardinal" type="text" id="homebaseCardinal" defaultValue={sensorData.homebaseCardinal} disabled/>

            <label className={styles['info-label']} htmlFor="homeBaseDistance">Homebase Distance:</label>
            <input className={styles['ROdata']} name="homeBaseDistance" type="text" id="homeBaseDistance" defaultValue={sensorData.homeBaseDistance} disabled/>

            <label className={styles['info-label']} htmlFor="currentWaypoint">Current Waypoint:</label>
            <input className={styles['ROdata']} name="currentWaypoint" type="text" id="currentWaypoint" defaultValue={sensorData.currentWaypoint} disabled/>

            <label className={styles['info-label']} htmlFor="waypointBearing">Waypoint bearing:</label>
            <input className={styles['ROdata']} name="waypointBearing" type="text" id="waypointBearing" defaultValue={sensorData.waypointBearing} disabled/>

            <label className={styles['info-label']} htmlFor="waypointCardinal">Waypoint Direction:</label>
            <input className={styles['ROdata']} name="waypointCardinal" type="text" id="waypointCardinal" defaultValue={sensorData.waypointCardinal} disabled/>
        
            <Button buttonText='Set Home' parentCallback={handleButton} buttonName="setHome" styleName='add-button'/>
            <div className={styles['error-message']}>
                {(error !== "") ? (
                    <div className={styles['error']}>{error}</div>
                ) : ((success !== "") ? (
                    <div className={styles['success']}>{success}</div>
                ) : (
                    <div className={styles['no-error']}></div>
                    )
                )}
            </div>
        </form>
    );
}