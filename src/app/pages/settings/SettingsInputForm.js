import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import styles from '../../styles/pages/InputForm.module.css';
import {StoreContext} from "../../contexts/StoreContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function SettingsInputForm({}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchSettings, getServerHost, restartHaptiCap} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [settingsData, setSettingsData] = useState({clientSSID: ""});

    async function onSubmit(){
        let serverHost = getServerHost();
            let json = JSON.stringify({asAP: settingsData.asAP, clientSSID: settingsData.clientSSID, clientPasswd: settingsData.clientPasswd, connectionTimeOut: settingsData.connectionTimeOut,
                deviceName: settingsData.deviceName, apPasswd: settingsData.apPasswd, gpsPollSec: settingsData.gpsPollSec, targetReached: settingsData.targetReached, 
                compPollMs: settingsData.compPollMs, compOffset: settingsData.compOffset, HOME_LAT: settingsData.HOME_LAT, HOME_LON: settingsData.HOME_LON, WAYPOINT_LAT: settingsData.WAYPOINT_LAT, 
                WAYPOINT_LON: settingsData.WAYPOINT_LON, declAngleRad: settingsData.declAngleRad, sleepMins: settingsData.sleepMins, touchThreshold: settingsData.touchThreshold,
                touchEnabled: settingsData.touchEnabled, maxDistance:settingsData.maxDistance, maxDelay:settingsData.maxDelay, timeZoneOffset:settingsData.timeZoneOffset, 
                ftpEnabled: settingsData.ftpEnabled});
            console.log(json);
            try{
                const response = await axios.post(serverHost + '/settings/settings_form', json, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log(response);
                setError("");
                setSuccess("");               
                if(response.status === 200){
                    setTimeout(500);
                    setSuccess("Settings changed");
                }else{
                    setError("Error");
                }
            }   catch (e){
                setError(e.response.data.message);
                if(e.response.status >= 401) {

                }else if(e.response.status === 400){
                    setError(e.response.data.message);
                }
            }
        }

    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        console.log(value);
        if (event.target.name === "asAP") {
            setSettingsData({...settingsData, asAP: value});
        }
        if (event.target.name === "clientSSID") {
            setSettingsData({...settingsData, clientSSID: value});
        }
        if (event.target.name === "clientPasswd") {
            setSettingsData({...settingsData, clientPasswd: value});
        }
        if (event.target.name === "connectionTimeOut") {
            setSettingsData({...settingsData, connectionTimeOut: value});
        }
        if (event.target.name === "deviceName") {
            setSettingsData({...settingsData, deviceName: value});
        }
        if (event.target.name === "apPasswd") {
            setSettingsData({...settingsData, apPasswd: value});
        }
        if (event.target.name === "gpsPollSec") {
            setSettingsData({...settingsData, gpsPollSec: value});
        }
        if (event.target.name === "targetReached") {
            setSettingsData({...settingsData, targetReached: value});
        }
        if (event.target.name === "compPollMs") {
            setSettingsData({...settingsData, compPollMs: value});
        }
        if (event.target.name === "compOffset") {
            setSettingsData({...settingsData, compOffset: value});
        }
        if (event.target.name === "HOME_LAT") {
            setSettingsData({...settingsData, HOME_LAT: value});
        }
        if (event.target.name === "HOME_LON") {
            setSettingsData({...settingsData, HOME_LON: value});
        }
        if (event.target.name === "WAYPOINT_LAT") {
            setSettingsData({...settingsData, WAYPOINT_LAT: value});
        }
        if (event.target.name === "WAYPOINT_LON") {
            setSettingsData({...settingsData, WAYPOINT_LON: value});
        }
        if (event.target.name === "declAngleRad") {
            setSettingsData({...settingsData, declAngleRad: value});
        }
        if (event.target.name === "sleepMins") {
            setSettingsData({...settingsData, sleepMins: value});
        }
        if (event.target.name === "maxDistance") {
            setSettingsData({...settingsData, maxDistance: value});
        }
        if (event.target.name === "maxDelay") {
            setSettingsData({...settingsData, maxDelay: value});
        }
        if (event.target.name === "timeZoneOffset") {
            setSettingsData({...settingsData, timeZoneOffset: value});
        }
        if (event.target.name === "touchThreshold") {
            setSettingsData({...settingsData, touchThreshold: value});
        }
        if (event.target.name === "touchEnabled") {
            setSettingsData({...settingsData, touchEnabled: value});
        }           
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        if(checkBoxValue.name === 'touchEnabled') {
            console.log(checkBoxValue.checked);
            setSettingsData({...settingsData, touchEnabled: checkBoxValue.checked});
        }
        if(checkBoxValue.name === 'asAP') {
            console.log(checkBoxValue.checked);
            setSettingsData({...settingsData, asAP: checkBoxValue.checked});
        }
        if(checkBoxValue.name === 'ftpEnabled') {
            console.log(checkBoxValue.checked);
            setSettingsData({...settingsData, ftpEnabled: checkBoxValue.checked});
        }
    };

    const handleButton = (event) => {
        console.log(event);
        if (event === "restart") {
            restartHaptiCap();
        }
    }

    useEffect( () => {
        fetchSettings().then(r => {
            setSettingsData(r);
            console.log(r);
        });
        
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} onSubmit={handleSubmit(onSubmit)}>
            <label className={styles['info-label']} htmlFor="asAP">Is AccessPoint</label>
            <Checkbox id='1' parentCallback={handleCheckBoxChange} defaultChecked={settingsData.asAP} disabled={false} name="asAP" labelname=""/>
            <label className={styles['info-label']} htmlFor="clientSSID">Client SSID:</label>
            <input className={styles['info-input']} name="clientSSID" type="text" id="clientSSID" defaultValue={settingsData.clientSSID} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="clientPasswd">Client Password:</label>
            <input className={styles['info-input']} name="clientPasswd" type="text" id="clientPasswd" defaultValue={settingsData.clientPasswd} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="connectionTimeOut">Connection Timeout:</label>
            <input className={styles['info-input']} name="connectionTimeOut" type="text" id="connectionTimeOut" defaultValue={settingsData.connectionTimeOut} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="deviceName">Devicename:</label>
            <input className={styles['info-input']} name="deviceName" type="text" id="deviceName" defaultValue={settingsData.deviceName} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="apPasswd">AP Password:</label>
            <input className={styles['info-input']} name="apPasswd" type="text" id="apPasswd" defaultValue={settingsData.apPasswd} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gpsPollSec">GPS Polling time (s):</label>
            <input className={styles['info-input']} name="gpsPollSec" type="text" id="gpsPollSec" defaultValue={settingsData.gpsPollSec} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="maxDistance">Max Distance (m):</label>
            <input className={styles['info-input']} name="maxDistance" type="text" id="maxDistance" defaultValue={settingsData.maxDistance} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="targetReached">Target reached (m):</label>
            <input className={styles['info-input']} name="targetReached" type="text" id="targetReached" defaultValue={settingsData.targetReached} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="maxDelay">Max Delay (dPulse ms):</label>
            <input className={styles['info-input']} name="maxDelay" type="text" id="maxDelay" defaultValue={settingsData.maxDelay} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="declAngleRad">Declanation Angle:</label>
            <input className={styles['info-input']} name="declAngleRad" type="text" id="declAngleRad" defaultValue={settingsData.declAngleRad} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="sleepMins">Sleeptime (mins):</label>
            <input className={styles['info-input']} name="sleepMins" type="text" id="sleepMins" defaultValue={settingsData.sleepMins} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="compPollMs">Compass polling time (ms):</label>
            <input className={styles['info-input']} name="compPollMs" type="text" id="compPollMs" defaultValue={settingsData.compPollMs} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="compOffset">Compass Offset (deg):</label>
            <input className={styles['info-input']} name="compOffset" type="text" id="compOffset" defaultValue={settingsData.compOffset} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="touchEnabled">Touch enabled</label>
            <Checkbox id='2' parentCallback={handleCheckBoxChange} defaultChecked={settingsData.touchEnabled} disabled={false} name="touchEnabled" labelname=""/>
            <label className={styles['info-label']} htmlFor="touchThreshold">Touch threshold:</label>
            <input className={styles['info-input']} name="touchThreshold" type="text" id="touchThreshold" defaultValue={settingsData.touchThreshold} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="timeZoneOffset">Timezone Offset (h):</label>
            <input className={styles['info-input']} name="timeZoneOffset" type="text" id="timeZoneOffset" defaultValue={settingsData.timeZoneOffset} onChange={handleInputUpdate} />            
            {/* <label className={styles['info-label']} htmlFor="ftpEnabled">FTP enabled</label>
            <Checkbox id='3' parentCallback={handleCheckBoxChange} defaultChecked={settingsData.ftpEnabled} disabled={false} name="ftpEnabled" labelname=""/> */}
            <input type="submit" id="submit-button" className={styles['apply-button']} value="Apply Changes"/>
            <Button buttonText='Restart HaptiCap' parentCallback={handleButton} buttonName="restart" styleName='add-button'/>
            <div className={styles['error-message']}>
                {(error !== "") ? (
                    <div className={styles['error']}>{error}</div>
                ) : ((success !== "") ? (
                    <div className={styles['success']}>{success}</div>
                ) : (
                    <div className={styles['no-error']}> </div>
                    )
                )}
            </div>
        </form>
    );
}