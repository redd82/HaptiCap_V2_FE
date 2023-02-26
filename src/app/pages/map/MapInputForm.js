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

export default function MapInputForm({map, newMap}) {
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

    async function uploadMapFile(fileToUpload) {
        console.log();
        let serverHost = getServerHost();
        let formData = new FormData();
        console.log(formData);
        if(checkFields(fileToUpload)){
            formData.append('file', fileToUpload);
            console.log(fileToUpload);
            console.log(formData);
            try {
                const response = await axios.post(serverHost + '/file-upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log(response);
                if(fileToUpload.type === "image/png"){
                    setMapData({...mapData, pngFile: response.data.filePath});
                }
                if(fileToUpload.type === ""){
                    setMapData({...mapData, kmlFile: response.data.filePath});
                }


                setError("");
                setSuccess("File uploaded.");
                return response;
            } catch (e) {
                setError(e.response.data.message);
                if (e.response.status >= 401) {
                } else if (e.response.status === 400) {
                    setError(e.response.data.message);
                }
            }
        }else{
            setError("Check input.");
        }
    }

    function useMap() {
        setSuccess("Map selected for use.");
    }

    function checkFields(fileToUpload) {
        console.log(fileToUpload);
        if(mapData.name === '' || mapData.country === '' || mapData.area === ''){
            return false;
        }
        return true;
    }

    const addObjectToArray = obj => {
    };

    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        if (event.target.name === "name") {
            setMapData({...mapData, name: value});
        }
        if (event.target.name === "country") {
            setMapData({...mapData, country: value});
        }
        if (event.target.name === "area") {
            setMapData({...mapData, area: value});
        }
    };

    useEffect( () => {
        if(newMap) {
            setReadOnly(false);
            setMapData({id: 0, name: "", country: "", mapPNG: "", kmlFile: ""});
        }else{

        }
        setLoading(false);
    }, []);

    if(loading) {
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
            <label className={styles['info-label']} htmlFor="name">Name:</label>
            {(newMap) ? (
                <input className={styles['info-input']} name="name" type="text" id="name" defaultValue={mapData.name} onChange={handleInputUpdate} />
            ) : (
                <div className={styles['valueRO-info-button']}>
                <div id={styles['valueRO-numberplate']}>{mapData.name}</div>
                </div>
            )}     
            <label className={styles['info-label']} htmlFor="country">Country:</label>
            {(newMap) ? (
                <input className={styles['info-input']} name="country" type="text" id="country" defaultValue={mapData.country} onChange={handleInputUpdate} />
            ) : (
                <div className={styles['valueRO-info-button']}>
                <div id={styles['valueRO-numberplate']}>{mapData.country}</div>
                </div>
            )}      
            <label className={styles['info-label']} htmlFor="area">Area: </label>
            {(readOnly) ? (<div className={styles['ROdata']}> {mapData.area}</div>
            ) : (
                <input className={styles['info-input']} name="area" type="text" id="area" defaultValue={mapData.area} onChange={handleInputUpdate}/>
                )
            }
            {(readOnly) ? (<></>) : (
                <>
                <label className={styles['info-label']} htmlFor="mapPNGFile">Map (PNG): </label>
                <FilePicker extensions={['png']}
                            onChange={FileObject => (uploadMapFile(FileObject))}
                            onError={errMsg => (setError(errMsg))}>
                    <button type="button" name="PNGUpload">
                        Upload PNG map file
                    </button>
                </FilePicker>
                </>
                )
            }
            {(readOnly) ? (<></>) : (
                <>
                <label className={styles['info-label']} htmlFor="kmlFile">KML map: </label>
                <FilePicker extensions={['kml']}
                            onChange={FileObject => (uploadMapFile(FileObject))}
                            onError={errMsg => (setError(errMsg))}>
                    <button type="button" name="KMLUpload">
                        Upload KML map file
                    </button>
                </FilePicker>
                </>
                )
            }
            {(newMap) ? (
                <div className={styles['empty-grid-space-2']}/>
            ): (
                <>
                    <div className={styles['empty-grid-space-1-front']}/>
                    <button className={styles['apply-button']} onClick={useMap} type="button"> Use map</button>
                </>
            )}
            {/* <div className={styles['empty-grid-space-1-front']}/>

            <input type="submit" id="submit-button" className={styles['apply-button']} value="Apply Changes"/> */}
            
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