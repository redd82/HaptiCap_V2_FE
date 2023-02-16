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
    const {storeData, fetchDebugSettings, getServerHost} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [debugSettingsData, setDebugSettingsData] = useState({});
    let newFaultTemp = {};


    async function onSubmit(data){
        let serverHost = getServerHost();
            console.log(data);
            let json = JSON.stringify({debug2Serial: debugSettingsData.debug2Serial, debug2Telnet:debugSettingsData.debug2Telnet, debugData2Serial: debugSettingsData.debugData2Serial,
                debugHaptic: debugSettingsData.debugHaptic});
                console.log(json);
            try{
                const response = await axios.post(serverHost + '/settings/debug_form', json, {
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

    const handleCheckBoxChange = (checkBoxValue) => {
        let checkValue = 0;
        if(checkBoxValue.checked){
            checkValue = 1;
        }else{
            checkValue = 0;
        }
        console.log(checkValue);
        if(checkBoxValue.name === 'debug2Serial') {
            setDebugSettingsData({...debugSettingsData, debug2Serial: checkValue});
        }
        if(checkBoxValue.name === 'debug2Telnet') {
            setDebugSettingsData({...debugSettingsData, debug2Telnet: checkValue});
        }
        if(checkBoxValue.name === 'debugData2Serial') {
            setDebugSettingsData({...debugSettingsData, debugData2Serial: checkValue});
        }
        if(checkBoxValue.name === 'debugHaptic') {
            setDebugSettingsData({...debugSettingsData, debugHaptic: checkValue});
        }
    };

    useEffect( () => {
        fetchDebugSettings().then(r => {
            setDebugSettingsData(r);
            console.log(r);
        });
        
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} onSubmit={handleSubmit(onSubmit)}>
                <Checkbox id='1' parentCallback={handleCheckBoxChange} disabled={false} name="debug2Serial" labelname="Serial" defaultChecked={debugSettingsData.debug2Serial}/>
                <label className={styles['info-label']} htmlFor="debug2Serial"></label>
                <Checkbox id='2' parentCallback={handleCheckBoxChange} disabled={false} name="debug2Telnet" labelname="Telnet" defaultChecked={debugSettingsData.debug2Telnet}/>
                <label className={styles['info-label']} htmlFor="debug2Telnet"></label>
                <Checkbox id='3' parentCallback={handleCheckBoxChange} disabled={false} name="debugData2Serial" labelname="Data 2Serial" defaultChecked={debugSettingsData.debugData2Serial}/>
                <label className={styles['info-label']} htmlFor="debugData2Serial"></label>     
                <Checkbox id='4' parentCallback={handleCheckBoxChange} disabled={false} name="debugHaptic" labelname="Haptic" defaultChecked={debugSettingsData.debugHaptic}/>
                <label className={styles['info-label']} htmlFor="debugHaptic"></label> 
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