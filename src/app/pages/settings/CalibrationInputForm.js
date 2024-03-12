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
        let serverHost = getServerHost();
            let json = JSON.stringify({compassCalibrated: calibrationData.compassCalibrated, compassOffset: calibrationData.compassOffset, magOffsetX: calibrationData.magOffsetX, magOffsetY: calibrationData.magOffsetY, magOffsetZ: calibrationData.magOffsetX, magRadius: calibrationData.magRadius,
                magScaleFacY: calibrationData.magScaleFacY, magScaleFacZ: calibrationData.magScaleFacZ, gyroBiasX: calibrationData.gyroBiasX, gyroBiasY: calibrationData.gyroBiasY, 
                gyroOffsetX: calibrationData.gyroOffsetX, gyroOffsetY: calibrationData.gyroOffsetY, gyroOffsetZ: calibrationData.gyroOffsetZ, accelOffsetX: calibrationData.accelOffsetX, 
                accelOffsetY: calibrationData.accelOffsetY, accelOffsetZ: calibrationData.accelOffsetZ, accelRadius: calibrationData.accelRadius});
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
            setCalibrationData({...calibrationData, compassOffset: value});
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
        if (event.target.name === "magScaleFacX") {
            setCalibrationData({...calibrationData, magRadius: value});
        }
        if (event.target.name === "magScaleFacX") {
            setCalibrationData({...calibrationData, gyroOffsetX: value});
        }
        if (event.target.name === "magScaleFacZ") {
            setCalibrationData({...calibrationData, gyroOffsetY: value});
        }
        if (event.target.name === "gyroBiasX") {
            setCalibrationData({...calibrationData, gyroOffsetZ: value});
        }
        if (event.target.name === "gyroBiasY") {
            setCalibrationData({...calibrationData, accelOffsetX: value});
        }
        if (event.target.name === "gyroBiasZ") {
            setCalibrationData({...calibrationData, accelOffsetY: value});
        }
        if (event.target.name === "accelBiasX") {
            setCalibrationData({...calibrationData, accelOffsetZ: value});
        }
        if (event.target.name === "accelBiasY") {
            setCalibrationData({...calibrationData, accelRadius: value});
        }
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        console.log(checkBoxValue.checked);
        if(checkBoxValue.name === 'calibrateMag') {
            setCalibrationData({...calibrationData, compassCalibrated: checkBoxValue.checked});
        }
    };

    const handleButton = (event) => {
        console.log(event);
        if (event === "calibrateCompass") {
            setCalibrationData({...calibrationData, compassCalibrated: false});
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
            <label className={styles['info-label']} htmlFor="compassOffset">Compass Offset:</label>
            <input className={styles['info-input']} name="compassOffset" type="text" id="compassOffset" defaultValue={calibrationData.compassOffset} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magOffsetX">Magnometer Bias X:</label>
            <input className={styles['info-input']} name="magOffsetX" type="text" id="magOffsetX" defaultValue={calibrationData.magOffsetX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magOffsetY">Magnometer Bias Y:</label>
            <input className={styles['info-input']} name="magOffsetY" type="text" id="magOffsetY" defaultValue={calibrationData.magOffsetY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magOffsetZ">Magnometer Bias Z:</label>
            <input className={styles['info-input']} name="magOffsetZ" type="text" id="magOffsetZ" defaultValue={calibrationData.magOffsetZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroOffsetX">Magnometer Scale X:</label>
            <input className={styles['info-input']} name="gyroOffsetX" type="text" id="gyroOffsetX" defaultValue={calibrationData.gyroOffsetX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroOffsetY">Magnometer Scale Y:</label>
            <input className={styles['info-input']} name="gyroOffsetY" type="text" id="gyroOffsetY" defaultValue={calibrationData.gyroOffsetY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroOffsetZ">Magnometer Scale Z:</label>
            <input className={styles['info-input']} name="gyroOffsetZ" type="text" id="gyroOffsetZ" defaultValue={calibrationData.gyroOffsetZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelOffsetX">Gyro Bias X:</label>
            <input className={styles['info-input']} name="accelOffsetX" type="text" id="accelOffsetX" defaultValue={calibrationData.accelOffsetX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelOffsetY">Gyro Bias Y:</label>
            <input className={styles['info-input']} name="accelOffsetY" type="text" id="accelOffsetY" defaultValue={calibrationData.accelOffsetY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelOffsetZ">Gyro Bias Z:</label>
            <input className={styles['info-input']} name="accelOffsetZ" type="text" id="accelOffsetZ" defaultValue={calibrationData.accelOffsetZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelRadius">Accel. Bias X:</label>
            <input className={styles['info-input']} name="accelRadius" type="text" id="accelRadius" defaultValue={calibrationData.accelRadius} onChange={handleInputUpdate} />
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