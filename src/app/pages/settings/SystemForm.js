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

            <label className={styles['info-label']} htmlFor="compassCardinal">Compass Cardinal Hdg:</label>
            <input className={styles['ROdata']} name="compassCardinal" type="text" id="compassCardinal" defaultValue={sensorData.compassCardinal} disabled/>  

            <label className={styles['info-label']} htmlFor="homeBaseLat">Homebase Lat:</label>
            <input className={styles['ROdata']} name="homeBaseLat" type="text" id="homeBaseLat" defaultValue={sensorData.homeBaseLat} disabled/>

            <label className={styles['info-label']} htmlFor="homeBaseLon">Homebase Lon:</label>
            <input className={styles['ROdata']} name="homeBaseLon" type="text" id="homeBaseLon" defaultValue={sensorData.homeBaseLon} disabled/>

            <label className={styles['info-label']} htmlFor="homeBaseBearing">Homebase bearing:</label>
            <input className={styles['ROdata']} name="homeBaseBearing" type="text" id="homeBaseBearing" defaultValue={sensorData.homeBaseBearing} disabled/>

            <label className={styles['info-label']} htmlFor="homeBaseCardinal">Homebase direction:</label>
            <input className={styles['ROdata']} name="homeBaseCardinal" type="text" id="homeBaseCardinal" defaultValue={sensorData.homeBaseCardinal} disabled/>

            <label className={styles['info-label']} htmlFor="homeBaseDistance">Homebase distance:</label>
            <input className={styles['ROdata']} name="homeBaseDistance" type="text" id="homeBaseDistance" defaultValue={sensorData.homeBaseDistance} disabled/>

            <label className={styles['info-label']} htmlFor="wayPointLat">Current Waypoint Lat:</label>
            <input className={styles['ROdata']} name="wayPointLat" type="text" id="wayPointLat" defaultValue={sensorData.wayPointLat} disabled/>

            <label className={styles['info-label']} htmlFor="wayPointLon">Current Waypoint Lon:</label>
            <input className={styles['ROdata']} name="wayPointLon" type="text" id="wayPointLon" defaultValue={sensorData.wayPointLon} disabled/>

            <label className={styles['info-label']} htmlFor="waypointBearing">Waypoint bearing:</label>
            <input className={styles['ROdata']} name="waypointBearing" type="text" id="wayPointBearing" defaultValue={sensorData.wayPointBearing} disabled/>

            <label className={styles['info-label']} htmlFor="wayPointCardinal">Waypoint direction:</label>
            <input className={styles['ROdata']} name="wayPointCardinal" type="text" id="wayPointCardinal" defaultValue={sensorData.wayPointCardinal} disabled/>

            <label className={styles['info-label']} htmlFor="wayPointDistance">Waypoint distance:</label>
            <input className={styles['ROdata']} name="wayPointDistance" type="text" id="wayPointDistance" defaultValue={sensorData.wayPointDistance} disabled/>
        
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