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

export default function CalibrationInputForm({}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {sortNames } = useContext(UtilityContext);
    const {parseDate, formatDate } = useContext(DateContext);
    const {storeData, fetchCalData, getServerHost} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [calibrationData, setCalibrationData ] = useState({magBiasX:""});
    let newFaultTemp = {};


    async function onSubmit(){
        let serverHost = getServerHost();
            let json = JSON.stringify({magBiasX: calibrationData.magBiasX, magBiasY: calibrationData.magBiasY, magBiasZ: calibrationData.magBiasZ, magScaleFacX: calibrationData.magScaleFacX,
                magScaleFacY: calibrationData.magScaleFacY, magScaleFacZ: calibrationData.magScaleFacZ, gyroBiasX: calibrationData.gyroBiasX, gyroBiasY: calibrationData.gyroBiasY, 
                gyroBiasZ: calibrationData.gyroBiasZ, accelBiasX: calibrationData.accelBiasX, accelBiasY: calibrationData.accelBiasY, accelBiasZ: calibrationData.accelBiasZ, 
                accelScaleX: calibrationData.accelScaleX, accelScaleY: calibrationData.accelScaleY, accelScaleZ: calibrationData.accelScaleZ});
            console.log(json);
            try{
                const response = await axios.post(serverHost + '/settings/calibration_form', json, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setError("");
                setSuccess(response.data.message);
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
        if (event.target.name === "magBiasX") {
            setCalibrationData({...calibrationData, magBiasX: value});
        }
        if (event.target.name === "magBiasY") {
            setCalibrationData({...calibrationData, magBiasY: value});
        }
        if (event.target.name === "magBiasZ") {
            setCalibrationData({...calibrationData, magBiasZ: value});
        }
        if (event.target.name === "magScaleFacX") {
            setCalibrationData({...calibrationData, magScaleFacX: value});
        }
        if (event.target.name === "magScaleFacX") {
            setCalibrationData({...calibrationData, magScaleFacX: value});
        }
        if (event.target.name === "magScaleFacZ") {
            setCalibrationData({...calibrationData, magScaleFacZ: value});
        }
        if (event.target.name === "gyroBiasX") {
            setCalibrationData({...calibrationData, gyroBiasX: value});
        }
        if (event.target.name === "gyroBiasY") {
            setCalibrationData({...calibrationData, gyroBiasY: value});
        }
        if (event.target.name === "gyroBiasZ") {
            setCalibrationData({...calibrationData, gyroBiasZ: value});
        }
        if (event.target.name === "accelBiasX") {
            setCalibrationData({...calibrationData, accelBiasX: value});
        }
        if (event.target.name === "accelBiasY") {
            setCalibrationData({...calibrationData, accelBiasY: value});
        }
        if (event.target.name === "accelBiasZ") {
            setCalibrationData({...calibrationData, accelBiasZ: value});
        }
        if (event.target.name === "accelScaleX") {
            setCalibrationData({...calibrationData, accelScaleX: value});
        }
        if (event.target.name === "accelScaleY") {
            setCalibrationData({...calibrationData, accelScaleY: value});
        }
        if (event.target.name === "accelScaleZ") {
            setCalibrationData({...calibrationData, accelScaleZ: value});
        }
    };

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
            <label className={styles['info-label']} htmlFor="magBiasX">Magnometer Bias X:</label>
            <input className={styles['info-input']} name="magBiasX" type="text" id="magBiasX" defaultValue={calibrationData.magBiasX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magBiasY">Magnometer Bias Y:</label>
            <input className={styles['info-input']} name="magBiasY" type="text" id="magBiasY" defaultValue={calibrationData.magBiasY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magBiasZ">Magnometer Bias Z:</label>
            <input className={styles['info-input']} name="magBiasZ" type="text" id="magBiasZ" defaultValue={calibrationData.magBiasZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magScaleFacX">Magnometer Scale X:</label>
            <input className={styles['info-input']} name="magScaleFacX" type="text" id="magScaleFacX" defaultValue={calibrationData.magScaleFacX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magScaleFacY">Magnometer Scale Y:</label>
            <input className={styles['info-input']} name="magScaleFacY" type="text" id="magScaleFacY" defaultValue={calibrationData.magScaleFacY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="magScaleFacZ">Magnometer Scale Z:</label>
            <input className={styles['info-input']} name="magScaleFacZ" type="text" id="magScaleFacZ" defaultValue={calibrationData.magScaleFacZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroBiasX">Gyro Bias X:</label>
            <input className={styles['info-input']} name="gyroBiasX" type="text" id="gyroBiasX" defaultValue={calibrationData.gyroBiasX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroBiasY">Gyro Bias Y:</label>
            <input className={styles['info-input']} name="gyroBiasY" type="text" id="gyroBiasY" defaultValue={calibrationData.gyroBiasY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="gyroBiasZ">Gyro Bias Z:</label>
            <input className={styles['info-input']} name="gyroBiasZ" type="text" id="gyroBiasZ" defaultValue={calibrationData.gyroBiasZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelBiasX">Accel. Bias X:</label>
            <input className={styles['info-input']} name="accelBiasX" type="text" id="accelBiasX" defaultValue={calibrationData.accelBiasX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelBiasY">Accel. Bias Y:</label>
            <input className={styles['info-input']} name="accelBiasY" type="text" id="accelBiasY" defaultValue={calibrationData.accelBiasY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelBiasZ">Accel. Bias Z:</label>
            <input className={styles['info-input']} name="accelBiasZ" type="text" id="accelBiasZ" defaultValue={calibrationData.accelBiasZ} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelScaleX">Accel. Scale X:</label>
            <input className={styles['info-input']} name="accelScaleX" type="text" id="accelScaleX" defaultValue={calibrationData.accelScaleX} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelScaleY">Accel. Scale Y:</label>
            <input className={styles['info-input']} name="accelScaleY" type="text" id="accelScaleY" defaultValue={calibrationData.accelScaleY} onChange={handleInputUpdate} />
            <label className={styles['info-label']} htmlFor="accelScaleZ">Accel. Scale Z:</label>
            <input className={styles['info-input']} name="accelScaleZ" type="text" id="accelScaleZ" defaultValue={calibrationData.accelScaleZ} onChange={handleInputUpdate} />            
            <input type="submit" id="submit-button" className={styles['apply-button']} value="Apply Changes"/>
            <div className={styles['empty-grid-space-4']}/>
            <div className={styles['error-message']}>
                {(error !== "") ? (
                    <div className={styles['error']}>{error}</div>
                ) : ((success !== "") ? (
                    <div className={styles['success']}>{success}</div>
                ) : (
                    <div className={styles['no-error']}> <br /> </div>
                    )
                )}
            </div>
        </form>
    );
}