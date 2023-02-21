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
    const {storeData, fetchGPSData, getServerHost, setHome} = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [gpsData, setGPSData ] = useState({magBiasX:""});
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
            fetchGPSData().then(r => {
                setGPSData(r);
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
            <input className={styles['ROdata']} name="nrOfSatellites" type="text" id="nrOfSatellites" defaultValue={gpsData.nrOfSattelites} />

            <label className={styles['info-label']} htmlFor="currentPositionLat">Current Position Lat:</label>
            <input className={styles['ROdata']} name="currentPositionLat" type="text" id="currentPositionLat" defaultValue={gpsData.ownLat} />

            <label className={styles['info-label']} htmlFor="currentPositionLon">Current Position Lon:</label>
            <input className={styles['ROdata']} name="currentPositionLon" type="text" id="currentPositionLon" defaultValue={gpsData.ownLon} />

            <label className={styles['info-label']} htmlFor="compassHeading">Compass Heading:</label>
            <input className={styles['ROdata']} name="compassHeading" type="text" id="compassHeading" defaultValue={gpsData.compassHeading} />

            <label className={styles['info-label']} htmlFor="compassCardinalHeading">Compass Cardinal Heading:</label>
            <input className={styles['ROdata']} name="compassCardinalHeading" type="text" id="compassCardinalHeading" defaultValue={gpsData.compassCardinalHeading} />  

            <label className={styles['info-label']} htmlFor="homebaseLat">Homebase Lat:</label>
            <input className={styles['ROdata']} name="homebaseLat" type="text" id="homebaseLat" defaultValue={gpsData.homeBaseLat} />

            <label className={styles['info-label']} htmlFor="homebaseLon">Homebase Lon:</label>
            <input className={styles['ROdata']} name="homebaseLon" type="text" id="homebaseLon" defaultValue={gpsData.homeBaseLon} />

            <label className={styles['info-label']} htmlFor="homeBearing">Homebase Bearing:</label>
            <input className={styles['ROdata']} name="homeBearing" type="text" id="homeBearing" defaultValue={gpsData.coarse2home} />

            <label className={styles['info-label']} htmlFor="homeDirection">Homebase Direction:</label>
            <input className={styles['ROdata']} name="homeDirection" type="text" id="homeDirection" defaultValue={gpsData.cardinal2home} />

            <label className={styles['info-label']} htmlFor="homeDistance">Homebase Distance:</label>
            <input className={styles['ROdata']} name="homeDistance" type="text" id="homeDistance" defaultValue={gpsData.distance2home} />

            <label className={styles['info-label']} htmlFor="currentWaypoint">Current Waypoint:</label>
            <input className={styles['ROdata']} name="currentWaypoint" type="text" id="currentWaypoint" defaultValue={gpsData.currentWaypoint} />

            <label className={styles['info-label']} htmlFor="waypointBearing">Waypoint bearing:</label>
            <input className={styles['ROdata']} name="waypointBearing" type="text" id="waypointBearing" defaultValue={gpsData.waypointBearing} />

            <label className={styles['info-label']} htmlFor="waypointDirection">Waypoint Direction:</label>
            <input className={styles['ROdata']} name="waypointDirection" type="text" id="waypointDirection" defaultValue={gpsData.waypointDirection} />

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