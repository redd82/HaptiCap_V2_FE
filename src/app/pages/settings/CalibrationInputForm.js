import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import styles from '../../styles/pages/InputForm.module.css';
import {CommsContext} from "../../contexts/CommsContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function CalibrationInputForm({}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchCalData, getServerHost} = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [calibrationData, setCalibrationData ] = useState({compassOffset:""});
    let newFaultTemp = {};

    async function onSubmit(){
        await sendSettings();
    }

    async function sendSettings(){
        let serverHost = getServerHost();
            let json = JSON.stringify({compassCalibrated: calibrationData.compassCalibrated, compassCalibrationMode:calibrationData.compassCalibrationMode, compassOffset: calibrationData.compassOffset, 
                magOffsetX: calibrationData.magOffsetX, magOffsetY: calibrationData.magOffsetY, magOffsetZ: calibrationData.magOffsetX, magSoftIron: calibrationData.magSoftIron,
                magScaleFacY: calibrationData.magScaleFacY, magScaleFacZ: calibrationData.magScaleFacZ, gyroBiasX: calibrationData.gyroBiasX, gyroBiasY: calibrationData.gyroBiasY, 
                gyroOffsetX: calibrationData.gyroOffsetX, gyroOffsetY: calibrationData.gyroOffsetY, gyroOffsetZ: calibrationData.gyroOffsetZ, accelOffsetX: calibrationData.accelOffsetX, 
                accelOffsetY: calibrationData.accelOffsetY, accelOffsetZ: calibrationData.accelOffsetZ, accSoftIron: calibrationData.accSoftIron});
                console.log(json);
            try{
                const response = await axios.post(serverHost + '/settings/calibration_form', json, {
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
            }   
                catch (e){
                setError(e.response.data.message);
                if(e.response.status >= 401) {

                }else if(e.response.status === 400){
                    setError(e.response.data.message);
                }
            }

    }

    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        if (event.target.name === "compassOffset") {
            setCalibrationData({...calibrationData, compassOffset: value}); //compassCalibrationMode
        }
        if (event.target.name === "compassCalibrationMode") {
            setCalibrationData({...calibrationData, compassCalibrationMode: value}); //compassCalibrationMode
        }        
        if (event.target.name === "magBiasX") {
            setCalibrationData({...calibrationData, magOffsetX: value});
        }
        if (event.target.name === "magBiasY") {
            setCalibrationData({...calibrationData, magOffsetY: value});
        }
        if (event.target.name === "magBiasZ") {
            setCalibrationData({...calibrationData, magOffsetZ: value});
        }
        if (event.target.name === "magSoftIron") {
            setCalibrationData({...calibrationData, magSoftIron: value});
        }
        if (event.target.name === "gyroOffsetX") {
            setCalibrationData({...calibrationData, gyroOffsetX: value});
        }
        if (event.target.name === "gyroOffsetY") {
            setCalibrationData({...calibrationData, gyroOffsetY: value});
        }
        if (event.target.name === "gyroOffsetZ") {
            setCalibrationData({...calibrationData, gyroOffsetZ: value});
        }
        if (event.target.name === "accelOffsetX") {
            setCalibrationData({...calibrationData, accelOffsetX: value});
        }
        if (event.target.name === "accelOffsetY") {
            setCalibrationData({...calibrationData, accelOffsetY: value});
        }
        if (event.target.name === "accelOffsetZ") {
            setCalibrationData({...calibrationData, accelOffsetZ: value});
        }
        if (event.target.name === "accSoftIron") {
            setCalibrationData({...calibrationData, accSoftIron: value});
        }
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        console.log(checkBoxValue.checked);
        if(checkBoxValue.name === 'compassCalibrated') {
            setCalibrationData({...calibrationData, compassCalibrated: checkBoxValue.checked});
        }
    };

    const handleButton = (event) => {
        console.log(event);
        if (event === "calibrateCompass") {
            setCalibrationData({...calibrationData, compassCalibrationMode: true});
            sendSettings();
        }
    }

    useEffect( () => {
        fetchCalData().then(r => {
            setCalibrationData(r);
            console.log(r);
        });
        
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} onSubmit={handleSubmit(onSubmit)}>
            <label className={styles['info-label']} htmlFor="compassCalibrated">Compass calibrated:</label>
            <Checkbox id='1' parentCallback={handleCheckBoxChange} defaultChecked={calibrationData.compassCalibrated} disabled={false} name="compassCalibrated" labelname=""/>
            <label className={styles['info-label']} htmlFor="compassCalibrationMode">Compass Cal.Mode:</label>
            <input className={styles['info-input']} name="compassCalibrationMode" type="text" id="compassCalibrationMode" defaultValue={calibrationData.compassCalibrationMode} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="compassOffset">Compass Offset:</label>
            <input className={styles['info-input']} name="compassOffset" type="text" id="compassOffset" defaultValue={calibrationData.compassOffset} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magOffsetX">Magnometer Offset X:</label>
            <input className={styles['info-input']} name="magOffsetX" type="text" id="magOffsetX" defaultValue={calibrationData.magOffsetX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magOffsetY">Magnometer Offset Y:</label>
            <input className={styles['info-input']} name="magOffsetY" type="text" id="magOffsetY" defaultValue={calibrationData.magOffsetY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magOffsetZ">Magnometer Offset Z:</label>
            <input className={styles['info-input']} name="magOffsetZ" type="text" id="magOffsetZ" defaultValue={calibrationData.magOffsetZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magSoftIron">Mag. SoftIron:</label>
            <input className={styles['info-input']} name="magSoftIron" type="text" id="magSoftIron" defaultValue={calibrationData.magSoftIron} onChange={handleInputUpdate} />            
            <label className={styles['info-label']} htmlFor="gyroOffsetX">Gyro offset X:</label>
            <input className={styles['info-input']} name="gyroOffsetX" type="text" id="gyroOffsetX" defaultValue={calibrationData.gyroOffsetX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroOffsetY">Gyro offset Y:</label>
            <input className={styles['info-input']} name="gyroOffsetY" type="text" id="gyroOffsetY" defaultValue={calibrationData.gyroOffsetY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroOffsetZ">Gyro offset Z:</label>
            <input className={styles['info-input']} name="gyroOffsetZ" type="text" id="gyroOffsetZ" defaultValue={calibrationData.gyroOffsetZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelOffsetX">Accel Offset X:</label>
            <input className={styles['info-input']} name="accelOffsetX" type="text" id="accelOffsetX" defaultValue={calibrationData.accelOffsetX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelOffsetY">Accel Offset Y:</label>
            <input className={styles['info-input']} name="accelOffsetY" type="text" id="accelOffsetY" defaultValue={calibrationData.accelOffsetY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelOffsetZ">Accel Offset Z:</label>
            <input className={styles['info-input']} name="accelOffsetZ" type="text" id="accelOffsetZ" defaultValue={calibrationData.accelOffsetZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accSoftIron">Accel. SoftIron:</label>
            <input className={styles['info-input']} name="accSoftIron" type="text" id="accSoftIron" defaultValue={calibrationData.accSoftIron} onChange={handleInputUpdate} />
            <input type="submit" id="submit-button" className={styles['apply-button']} value="Apply Changes"/>
            <Button buttonText='Calibrate Compass' parentCallback={handleButton} buttonName="calibrateCompass" styleName='add-button'/>
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