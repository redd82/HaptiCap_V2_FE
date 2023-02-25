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
import {CommsContext} from "../../contexts/CommsContext";
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";

export default function Waypoints({map, newMap}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {fetchMapList} = useContext(MapsContext);
    const {sortNames } = useContext(UtilityContext);
    const {parseDate, formatDate } = useContext(DateContext);
    const {storeData, fetchData, getServerHost} = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [mapData, setMapData] = useState(map);
    let newFaultTemp = {};


    async function onSubmit(data){

    }

    const handleComboChange = (event) => {
        console.log(event);
        const value = event?.target?.value;
        setMapData({...mapData, name: value});
        console.log(mapData);
    };

    const addObjectToArray = obj => {
        //setCarFaultList(current => [...current, obj]);
    };

    // const handleFaultCheckbox = (event) => {
    //     updateFaultData(event);
    //     console.log(carFaultList);
    // }

    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        // if (event.target.name === "documentNr") {
        //     setCarDocDetails({...carDocDetails, documentNr: value});
        // }
    };

    useEffect( () => {
        if(newMap) {
            setReadOnly(false);
        }else{

        }
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} >
            <label className={styles['info-label']} htmlFor="id">ID: </label>
            {(newMap) ? (
                    <label>(new)</label>
                ) : (
                    <div id="id">{mapData.id}</div>
            )}
        </form>
    );
}