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


    async function uploadFile(fileToUpload){
        let serverHost = getServerHost();
        let expectedFilename = mapData.name + '.png';
        let formData = new FormData();
        formData.append('file', fileToUpload);
        console.log(fileToUpload);
        console.log(expectedFilename);
        if(fileToUpload.name === expectedFilename) {
            console.log(formData);
            try {
                const response = await axios.post(serverHost + '/file-upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log(response.data.filePath);
                setMapData({...mapData, filePathName: response.data.filePath});
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
            setError("Filename doesn't match map name!");
        }
    }

    async function handleDownload(){
        let serverHost = getServerHost();
        let fileName = mapData.name + '.pdf';
        try {
            axios({
                url: serverHost + `/api/maps/${fileName}`,
                method: 'GET',
                responseType: 'blob',
                headers: {

                         }
            }).then((response) => {
                saveAs(response.data, fileName);
            });
        } catch (e) {
            setError(e.response.data.message);
            if (e.response.status >= 401) {
            } else if (e.response.status === 400) {
                setError(e.response.data.message);
            }
        }
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
            setMapData({id: 0, name: "", country: "", mapFile: "", kmlFile: ""});
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
                <div id={styles['valueRO-numberplate']}>{mapData.name}</div>
                </div>
            )}      
            <label className={styles['info-label']} htmlFor="area">Area: </label>
            {(readOnly) ? (<div className={styles['ROdata']}> {mapData.country}</div>) : (
                <input className={styles['info-input']} name="area" type="text" id="area" defaultValue={mapData.area} onChange={handleInputUpdate}/>
                )
            }
            {(readOnly) ? (<></>) : (
                <>
                <label className={styles['info-label']} htmlFor="documentPath">Map: </label>
                <FilePicker extensions={['png']}
                            onChange={FileObject => (uploadFile(FileObject))}
                            onError={errMsg => (setError(errMsg))}>
                    <button type="button">
                        Upload map file
                    </button>
                </FilePicker>
                </>
                )
            }
            {(readOnly) ? (<></>) : (
                <>
                <label className={styles['info-label']} htmlFor="documentPath">KML: </label>
                <FilePicker extensions={['kml']}
                            onChange={FileObject => (uploadFile(FileObject))}
                            onError={errMsg => (setError(errMsg))}>
                    <button type="button">
                        Upload KML file
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
                    <button className={styles['apply-button']} onClick={handleDownload} type="button"> Use map</button>
                </>
            )}
            <div className={styles['empty-grid-space-1-front']}/>
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