import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import styles from '../../styles/pages/InputForm.module.css';
import {CommsContext} from "../../contexts/CommsContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function DebugInputForm({}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchDebugSettings, getServerHost} = useContext(CommsContext);
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

    const addObjectToArray = obj => {
        //setCarFaultList(current => [...current, obj]);
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        if(checkBoxValue.name === 'debug2Serial') {
            setDebugSettingsData({...debugSettingsData, debug2Serial: checkBoxValue});
        }
        if(checkBoxValue.name === 'debug2Telnet') {
            setDebugSettingsData({...debugSettingsData, debug2Telnet: checkBoxValue});
        }
        if(checkBoxValue.name === 'debugData2Serial') {
            setDebugSettingsData({...debugSettingsData, debugData2Serial: checkBoxValue});
        }
        if(checkBoxValue.name === 'debugHaptic') {
            setDebugSettingsData({...debugSettingsData, debugHaptic: checkBoxValue});
        }
    };

    function setCheckboxes(){
        
    }

    useEffect( () => {
        fetchDebugSettings().then(r => {
            setDebugSettingsData(r);
            setCheckboxes(r);
            console.log(r);
        });
        
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} onSubmit={handleSubmit(onSubmit)}>
                <Checkbox id='1' parentCallback={handleCheckBoxChange} disabled={false} name="debug2Serial" labelname="" defaultChecked={debugSettingsData.debug2Serial}/>
                <label className={styles['info-label']} htmlFor="debug2Serial">Serial</label>
                <Checkbox id='2' parentCallback={handleCheckBoxChange} disabled={false} name="debug2Telnet" labelname="" defaultChecked={debugSettingsData.debug2Telnet}/>
                <label className={styles['info-label']} htmlFor="debug2Telnet">Telnet</label>
                <Checkbox id='3' parentCallback={handleCheckBoxChange} disabled={false} name="debugData2Serial" labelname="" defaultChecked={debugSettingsData.debugData2Serial}/>
                <label className={styles['info-label']} htmlFor="debugData2Serial">Data 2Serial</label>     
                <Checkbox id='4' parentCallback={handleCheckBoxChange} disabled={false} name="debugHaptic" labelname="" defaultChecked={debugSettingsData.debugHaptic}/>
                <label className={styles['info-label']} htmlFor="debugHaptic">Haptic</label> 
                <input type="submit" id="submit-button" className={styles['apply-button']} value="Apply Changes"/>
            <div className={styles['empty-grid-space-4']}/>
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