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
    const {storeData, fetchCalData, getServerHost} = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [systemData, setSystemData ] = useState({magBiasX:""});
    let newFaultTemp = {};


    async function onSubmit(){
        // let serverHost = getServerHost();
        //     let json = JSON.stringify({magBiasX: calibrationData.magBiasX, magBiasY: calibrationData.magBiasY, magBiasZ: calibrationData.magBiasZ, magScaleFacX: calibrationData.magScaleFacX,
        //         magScaleFacY: calibrationData.magScaleFacY, magScaleFacZ: calibrationData.magScaleFacZ, gyroBiasX: calibrationData.gyroBiasX, gyroBiasY: calibrationData.gyroBiasY, 
        //         gyroBiasZ: calibrationData.gyroBiasZ, accelBiasX: calibrationData.accelBiasX, accelBiasY: calibrationData.accelBiasY, accelBiasZ: calibrationData.accelBiasZ, 
        //         accelScaleX: calibrationData.accelScaleX, accelScaleY: calibrationData.accelScaleY, accelScaleZ: calibrationData.accelScaleZ});
        //     console.log(json);
        //     try{
        //         const response = await axios.post(serverHost + '/settings/calibration_form', json, {
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //         });
        //         console.log(response);
        //         setError("");
        //         setSuccess("");               
        //         if(response.status === 200){
        //             setTimeout(500);
        //             setSuccess("Settings changed");
        //         }else{
        //             setError("Error");
        //         }
        //     }   
        //         catch (e){
        //         setError(e.response.data.message);
        //         if(e.response.status >= 401) {

        //         }else if(e.response.status === 400){
        //             setError(e.response.data.message);
        //         }
        //     }
        }

    const handleButton = (event) => {
        console.log(event);
        if (event === "calibrate") {
            
        }
    }

    useEffect( () => {
        // fetchCalData().then(r => {
        //     setCalibrationData(r);
        //     console.log(r);
        // });
      
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} onSubmit={handleSubmit(onSubmit)}>
            <label className={styles['info-label']} htmlFor="homebaseLat">Homebase Lat:</label>
            <input className={styles['ROdata']} name="homebaseLat" type="text" id="homebaseLat" defaultValue={systemData.homebase} />
            <label className={styles['info-label']} htmlFor="homebaseLon">Homebase Lon:</label>
            <input className={styles['ROdata']} name="homebaseLon" type="text" id="homebaseLon" defaultValue={systemData.homebase} />
            <label className={styles['info-label']} htmlFor="homeBearing">Homebase Bearing:</label>
            <input className={styles['ROdata']} name="homeBearing" type="text" id="homeBearing" defaultValue={systemData.homeBearing} />
            <label className={styles['info-label']} htmlFor="homeDirection">Homebase Direction:</label>
            <input className={styles['ROdata']} name="homeDirection" type="text" id="homeDirection" defaultValue={systemData.homeDirection} />
            <label className={styles['info-label']} htmlFor="homeDistance">Homebase Distance:</label>
            <input className={styles['ROdata']} name="homeDistance" type="text" id="homeDistance" defaultValue={systemData.homeDistance} />
            <label className={styles['info-label']} htmlFor="currentWaypoint">Current Waypoint:</label>
            <input className={styles['ROdata']} name="currentWaypoint" type="text" id="currentWaypoint" defaultValue={systemData.currentWaypoint} />
            <label className={styles['info-label']} htmlFor="currentPosition">Current Position:</label>
            <input className={styles['ROdata']} name="currentPosition" type="text" id="currentPosition" defaultValue={systemData.currentPosition} />
            <label className={styles['info-label']} htmlFor="nrOfSatellites">Number of Sats.:</label>
            <input className={styles['ROdata']} name="nrOfSatellites" type="text" id="nrOfSatellites" defaultValue={systemData.nrOfSatellites} />
            <label className={styles['info-label']} htmlFor="waypointBearing">Waypoint bearing:</label>
            <input className={styles['ROdata']} name="waypointBearing" type="text" id="waypointBearing" defaultValue={systemData.waypointBearing} />
            <label className={styles['info-label']} htmlFor="waypointDirection">Waypoint Direction:</label>
            <input className={styles['ROdata']} name="waypointDirection" type="text" id="waypointDirection" defaultValue={systemData.waypointDirection} />
            <label className={styles['info-label']} htmlFor="compassHeading">Compass Heading:</label>
            <input className={styles['ROdata']} name="compassHeading" type="text" id="compassHeading" defaultValue={systemData.compassHeading} />
            <label className={styles['info-label']} htmlFor="compassCardinalHeading">Compass Cardinal Heading:</label>
            <input className={styles['ROdata']} name="compassCardinalHeading" type="text" id="compassCardinalHeading" defaultValue={systemData.compassCardinalHeading} />  
            <Button buttonText='Lead the way' parentCallback={handleButton} buttonName="calibrate" styleName='add-button'/>
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