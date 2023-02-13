import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import styles from '../../styles/pages/InputForm.module.css';
import {UtilityContext} from "../../contexts/UtilityContext";
import {DateContext} from "../../contexts/DateContext";
import {StoreContext} from "../../contexts/StoreContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function DebugInputForm({}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {sortNames } = useContext(UtilityContext);
    const {parseDate, formatDate } = useContext(DateContext);
    const {storeData, fetchSettings, getServerHost} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [settingsData, setSettingsData] = useState();
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
            try{
                const response = await axios.put(serverHost + '/api/cars/documents/updateDocument', json, {
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

    const addObjectToArray = obj => {
        //setCarFaultList(current => [...current, obj]);
    };

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
            setSettingsData({...settingsData, workOrderDone: checkBoxValue.checked});
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
                <Checkbox parentCallback={handleCheckBoxChange} disabled={false} name="debugSerial"/>
                <label className={styles['info-label']} htmlFor="debugSerial">Debug to Serial</label>
                <Checkbox parentCallback={handleCheckBoxChange} disabled={false} name="debugSerial"/>
                <label className={styles['info-label']} htmlFor="debugSerial">Debug to Serial</label>
                <Checkbox parentCallback={handleCheckBoxChange} disabled={false} name="debugSerial"/>
                <label className={styles['info-label']} htmlFor="debugSerial">Debug to Serial</label>          
        </form>
    );
}