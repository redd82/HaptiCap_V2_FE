import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {MapsContext} from "../../contexts/MapsContext";
import ComboBox from "../components/ComboBox";
import {FilePicker} from 'react-file-picker';
import {nl} from "date-fns/locale";
import styles from '../../styles/pages/InputForm.module.css';
import {saveAs} from 'file-saver'
import {UtilityContext} from "../../contexts/UtilityContext";
import {DateContext} from "../../contexts/DateContext";
import {StoreContext} from "../../contexts/StoreContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function SettingsInputForm({}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {sortNames } = useContext(UtilityContext);
    const {parseDate, formatDate } = useContext(DateContext);
    const {storeData, fetchSettings, getServerHost} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [settingsData, setSettingsData] = useState({clientSSID: ""});
    let newFaultTemp = {};


    async function onSubmit(data){
        let serverHost = getServerHost();
            console.log(data);
            let json = '';
            // let json = JSON.stringify({documentNr: carDocDetails.documentNr, filePathName:data.filePathName, inspectionCode: carDocDetails.inspectionCode,
            //     firstRegistrationDate: carDocDetails.firstRegistrationDate, lastOwnerChangeDate: carDocDetails.lastOwnerChangeDate, numberOrCompanyName: carDocDetails.numberOrCompanyName,
            //     registrationType: carDocDetails.registrationType, carDTO: {id: carData.id, brand:carData.brand, model:carData.model, year:carData.year, version:carData.version,
            //     nrOfDrivenKMs:carData.nrOfDrivenKMs, numberPlate:carData.numberPlate, lastCheckupDate: carData.lastCheckupDate, broughtInDate: carData.broughtInDate,
            //     workFinishedDate:carData.workFinishedDate}});
            // console.log(json);
            // try{
            //     const response = await axios.put(serverHost + '/api/cars/documents/updateDocument', json, {
            //         headers: {
            //             "Content-Type": "application/json",
            //         },
            //     });
            //     setError("");
            //     setSuccess(response.data.message);
            // }   catch (e){
            //     setError(e.response.data.message);
            //     if(e.response.status >= 401) {

            //     }else if(e.response.status === 400){
            //         setError(e.response.data.message);
            //     }
            // }
        }

    const addObjectToArray = obj => {
        //setCarFaultList(current => [...current, obj]);
    };

    const handleComboChange = (event) => {
        console.log(event);
        const value = event?.target?.value;
    };

    const handleFaultCheckbox = (event) => {
        //updateFaultData(event);
        console.log();
    }

    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        // if (event.target.name === "documentNr") {
        //     setCarDocDetails({...carDocDetails, documentNr: value});
        // }
        // if (event.target.name === "filePathName") {
        //     setCarDocDetails({...carDocDetails, filePathName: value});
        // }
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        if(checkBoxValue.name === 'debugSerial') {
            setSettingsData({...settingsData, touchEnabled: checkBoxValue.checked});
        }
    };

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
            <label className={styles['info-label']} htmlFor="clientSSID">Client SSID:</label>
            <input className={styles['info-input']} name="clientSSID" type="text" id="clientSSID" defaultValue={settingsData.clientSSID} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="clientPasswd">Client Password:</label>
            <input className={styles['info-input']} name="clientPasswd" type="text" id="clientPasswd" defaultValue={settingsData.clientPasswd} onChange={handleInputUpdate} />
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
            <label className={styles['info-label']} htmlFor="touchThreshold">Touch threshold:</label>
            <input className={styles['info-input']} name="touchThreshold" type="text" id="touchThreshold" defaultValue={settingsData.touchThreshold} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="timeZoneOffset">Timezone Offset (h):</label>
            <input className={styles['info-input']} name="timeZoneOffset" type="text" id="timeZoneOffset" defaultValue={settingsData.timeZoneOffset} onChange={handleInputUpdate} />            
        </form>
    );
}