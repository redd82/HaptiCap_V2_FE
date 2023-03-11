import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {FilePicker} from 'react-file-picker';
import {CommsContext} from "../../contexts/CommsContext";
import { StoreContext } from '../../contexts/StoreContext';
import styles from '../../styles/pages/InputForm.module.css';
import stylesContent from '../../styles/Content.module.css';
import Button from "../components/Button";

export default function MapInputForm({map, newMap}) {
    // console.log(map.pngFile);
    const navigate = useNavigate();
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchData, getServerHost} = useContext(CommsContext);
    const {setHomeToUseMap} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploading, setUploading] = useState(false);
    const [readOnly, setReadOnly] = useState(true);
    const [editMap, setEditMap] = useState(newMap);
    const [mapData, setMapData] = useState(map);
    const [pngUploaded, setPngUploaded] = useState(false);
    const [kmlUploaded, setKmlUploaded] = useState(false);
    let maxFileSize = 1.7;
    let newFaultTemp = {};


    async function uploadMapFile(fileToUpload) {
        setError("");
        let serverHost = getServerHost();
        let formData = new FormData();
        if(checkFields(fileToUpload)){
            formData.append('file', fileToUpload);
            console.log(fileToUpload);
            console.log(formData);
            try {
                setSuccess("Uploading file....");
                setLoading(true);
                const response = await axios.post(serverHost + '/file-upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                });
                console.log(response);
                let fileType = fileToUpload.type;
                if(response.data === "Wrong filetype."){
                    setError("Upload failed.");
                    setLoading(false);
                } else {
                    setSuccess("File uploaded.");
                    setLoading(false);
                switch (fileType.toLowerCase()) {
                    case "image/png" :
                        console.log("fileToUpload.name");
                        console.log("png uploaded");
                        setPngUploaded(true);
                        setSuccess("PNG File uploaded.");
                        setMapData({...mapData, pngFile: "/maps/" + fileToUpload.name});
                        setLoading(false);
                        break;
                    case "application/vnd.google-earth.kml+xml" :
                        console.log("kml uploaded");
                        setKmlUploaded(true);
                        setSuccess("KML File uploaded.");
                        setMapData({...mapData, kmlFile: "/maps/" + fileToUpload.name});
                        setLoading(false);
                        sendMapInfo();
                        break;
                    default :
                        setSuccess("");
                        setLoading(false);
                        setError("Wrong filetype upload.");
                        break;
                }
            }
                return response;
            } catch (e) {
                setError(e.response.data.message);
                if (e.response.status >= 401) {
                } else if (e.response.status === 400) {
                    setError(e.response.data.message);
                }
            }
        }else{
            setError("Check missing input.");
        }
    }

    async function sendMapInfo(){
        let serverHost = getServerHost();
        let json = JSON.stringify({id: mapData.id, name: mapData.name, country: mapData.country, area: mapData.area});
        console.log(json);
        try{
            const response = await axios.post(serverHost + '/navigation/register-map', json, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(response);
            setError("");
            setSuccess("");               
            if(response.status === 200){
                setTimeout(500);
                setSuccess("Map registered.");
                setError("");
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

    async function requestMap(){
        let serverHost = getServerHost();
        let json = JSON.stringify({id: mapData.id, name: mapData.name, country: mapData.country, area: mapData.area, pngFile: mapData.pngFile, kmlFile: mapData.kmlFile});
        console.log(json);
        try{
            const response = await axios.post(serverHost + '/navigation/request-map', json, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(response);
            setError("");
            setSuccess("");               
            if(response.status === 200){
                setTimeout(500);
                setSuccess("Map request sent.");
                setError("");
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

    async function clearMap(){
        let serverHost = getServerHost();
        setMapData({...mapData, id: mapData.id, name: "NoMap", country: "NoMap", area: "NoMap", pngFile: "NoMap.png", kmlFile: "NoMap.kml"});
        let json = JSON.stringify({id: mapData.id, name: "NoMap", country: "NoMap", area: "NoMap", pngFile: mapData.pngFile, kmlFile: mapData.kmlFile});
        console.log(json);
        try{
            const response = await axios.post(serverHost + '/navigation/clear-map', json, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(response);
            setError("");
            setSuccess("");               
            if(response.status === 200){
                setTimeout(500);
                setSuccess("Map clear sent.");
                setError("");
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

    function editSelectedMap(){
        setEditMap(true);
    }

    function saveChangesSelectedMap(){
        setEditMap(false);
        sendMapInfo();
    }

    function useMap() {
        requestMap();
        setHomeToUseMap(mapData);
        console.log("navigate to usemap");
        navigate("../use-map", { state: {mapData} });   //id: map.id, name: map.name, country: map.country
    }

    function checkFields(fileToUpload) {
        console.log(fileToUpload);
        if(mapData.name === '' || mapData.country === '' || mapData.area === '' || fileToUpload.name === 'current.png'){
            return false;
        }else{

        }
        return true;
    }

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
        setMapData(map);
        setLoading(false);
    }, []);

    return (
        <form className={styles['info-form']} >
            <label className={styles['info-label']} htmlFor="id">ID: </label>
            <div id="id">{mapData.id}</div>
            <label className={styles['info-label']} htmlFor="name">Name (short):</label>
            {(editMap) ? (
                <input className={styles['info-input']} name="name" type="text" id="name" defaultValue={mapData.name} onChange={handleInputUpdate} />
            ) : (
                <div className={styles['valueRO-info-button']}>
                <div id={styles['valueRO-numberplate']}>{mapData.name}</div>
                </div>
            )}     
            <label className={styles['info-label']} htmlFor="country">Country:</label>
            {(editMap) ? (
                <input className={styles['info-input']} name="country" type="text" id="country" defaultValue={mapData.country} onChange={handleInputUpdate} />
            ) : (
                <div className={styles['valueRO-info-button']}>
                <div id={styles['valueRO-numberplate']}>{mapData.country}</div>
                </div>
            )}      
            <label className={styles['info-label']} htmlFor="area">Area: </label>
            {(editMap) ? (
                <input className={styles['info-input']} name="area" type="text" id="area" defaultValue={mapData.area} onChange={handleInputUpdate}/>
            ) : (
                <div className={styles['valueRO-info-button']}>
                <div id={styles['valueRO-numberplate']}>{mapData.area}</div>
                </div>
            )}
            {(!editMap) ? (<></>) : (
                <>
                <label className={styles['info-label']} htmlFor="mapPNGFile">Map (PNG): </label>
                <FilePicker maxSize={maxFileSize}
                            extensions={['png']}
                            onChange={FileObject => (uploadMapFile(FileObject))}
                            onError={errMsg => (setError(errMsg))}>
                    <button type="button">
                        Upload PNG map file
                    </button>
                </FilePicker>
                </>
                )
            }
            {(!editMap) ? (<></>) : (
                    (!pngUploaded) ? (<></>) : (
                <>
                <label className={styles['info-label']} htmlFor="kmlFile">KML map: </label>
                <FilePicker extensions={['kml']}
                            onChange={FileObject => (uploadMapFile(FileObject))}
                            onError={errMsg => (setError(errMsg))}>
                    <button type="button">
                        Upload KML map file
                    </button>
                </FilePicker>
                </>
                    )
                )
            }
            {(editMap) ? ( 
                (!kmlUploaded) ? 
                    (
                        <button className={styles['apply-button']} onClick={saveChangesSelectedMap} type="button"> Save Changes</button>
                    ):(
                        <>
                            <button className={styles['apply-button']} onClick={saveChangesSelectedMap} type="button"> Save Changes</button>
                        </>
                    )
            ): (
                (mapData.name === "NoMap") ? (        
                    <>
                        <button className={styles['apply-button']} onClick={editSelectedMap} type="button"> Edit Map</button>
                        <button className={styles['apply-button']} onClick={useMap} type="button"> Use Map</button>
                    </>            
                ) : (
                    <>
                        <button className={styles['apply-button']} onClick={editSelectedMap} type="button"> Edit Map</button>
                        <button className={styles['apply-button']} onClick={useMap} type="button"> Use Map</button>
                        <button className={styles['apply-button']} onClick={clearMap} type="button"> Delete Map</button>
                    </>
                )
            )}          
            <div className={styles['empty-grid-space-4']}/>
            <div className={styles['error-message']}>
                {(loading) ? (    
                    <>
                        <div className={styles['success']}>{success}</div>             
                        <div className={stylesContent['loader-container-mapinput']}>
                            <div className={stylesContent['spinner']}> </div>
                        </div> 
                    </>
                ): (
                (error !== "") ? (
                    <div className={styles['error']}>{error}</div>
                    ) : (
                        (success !== "") ? (
                            <div className={styles['success']}>{success}</div>
                        ) : (
                        <div className={styles['no-error']}> <br /> </div>
                        )
                )
                )
                }
            </div>
        </form>
    );
}