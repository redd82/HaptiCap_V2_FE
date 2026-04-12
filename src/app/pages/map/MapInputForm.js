import React, {useContext, useEffect, useState} from 'react';

import {useNavigate} from "react-router-dom";
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {FilePicker} from 'react-file-picker';
import {CommsContext} from "../../contexts/CommsContext";
import { StoreContext } from '../../contexts/StoreContext';
import { MapsContext } from '../../contexts/MapsContext';
import styles from '../../styles/pages/InputForm.module.css';
import stylesContent from '../../styles/Content.module.css';
import Button from "../components/Button";

export default function MapInputForm({map, newMap}) {
    const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
    const navigate = useNavigate();
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchData, getServerHost} = useContext(CommsContext);
    const {fetchKMLFile, requestMap, sendMapInfoToESP} = useContext(MapsContext);
    const {setHomeToUseMap} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const { formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [uploading, setUploading] = useState(false);
    const [readOnly, setReadOnly] = useState(true);
    const [editMap, setEditMap] = useState(newMap);
    const [mapData, setMapData] = useState(map);
    const [pngUploaded, setPngUploaded] = useState(false);
    const [kmlUploaded, setKmlUploaded] = useState(false);
    const [kmlData, setKmlData] = useState(null);
    const [useMap, setUseMap] = useState (false);
    let maxFileSize = 1.7;
    let newFaultTemp = {};
    let mapDataTemp = {};

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
                return [fileToUpload, response];
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

    async function processFileData(fileToUpload, uploadResponse){
        let serverHost = getServerHost();
        console.log(fileToUpload.name);
        let fileType = fileToUpload.type;
        if(uploadResponse.data === "Wrong filetype."){
            setError("Upload failed.");
            setLoading(false);
        } else {
            switch (fileType.toLowerCase()) {
                case "image/png" :
                    const response = await axios.get(serverHost + "/maps/" + fileToUpload.name , { responseType: 'blob' });
                    console.log(response);
                    const blob = response.data;
                    const image = new Image();
                    image.src = URL.createObjectURL(blob);
                    image.onload = function() {
                        setMapData({...mapData, pngFile: fileToUpload.name, imageHeight: this.height, imageWidth: this.width});
                    }
                    console.log(fileToUpload.name);
                    console.log("png uploaded");
                    setPngUploaded(true);
                    setSuccess("PNG File uploaded.");
                    setLoading(false);
                    break;
                case "application/vnd.google-earth.kml+xml" :
                    console.log("kml uploaded");
                    let kmlDataArray = await extractKMLData("/maps/" + fileToUpload.name);
                    console.log(kmlDataArray);
                    setMapData({...mapData, kmlFile: fileToUpload.name, north: kmlDataArray[0].north, west: kmlDataArray[0].west, south: kmlDataArray[0].south, east: kmlDataArray[0].east, rotation: kmlDataArray[0].rotation });
                    setKmlUploaded(true);
                    setSuccess("KML File uploaded.");
                    setLoading(false);
                    break;
                default :
                    setSuccess("");
                    setLoading(false);
                    setError("Wrong filetype upload.");
                    break;
            }
        }
    }

    function putKMLDataInArray(kmlData){
        const parser = new XMLParser();
        const options = {
            attributeNamePrefix: '',
            ignoreAttributes: false,
            ignoreNameSpace: false,
            parseNodeValue: true,
            parseAttributeValue: true,
            trimValues: true
        };

        const result = parser.parse(kmlData, options);
        console.log(result);
        const latLonBox = result.kml.Document.Folder.GroundOverlay.LatLonBox;

        const waypoints = result.kml.Document.Folder.Folder.Placemark;
        
        return [latLonBox, waypoints];
    };

    async function extractKMLData(fileName){
        let response = await fetchKMLFile(fileName);
        console.log(response);
        let kml = response.data;
        let kmlDataArray = putKMLDataInArray(kml);
        console.log(kmlDataArray);
        console.log(kmlDataArray[0]);
        return kmlDataArray;
    }

    async function sendMapInfo(type){
        console.log(mapData);
        let response = "";
        let serverHost = getServerHost();
        let json = JSON.stringify({id: mapData.id, name: mapData.name, country: mapData.country, area: mapData.area, pngFile: mapData.pngFile, imageWidth: mapData.imageWidth, imageHeight: mapData.imageHeight,
                                    kmlFile: mapData.kmlFile, realWorldHeight: mapData.realWorldHeight, realWorldWidth: mapData.realWorldWidth, scaleHeight: mapData.scaleHeight, scaleWidth: mapData.scaleWidth,
                                    north: mapData.north, west: mapData.west, south: mapData.south, east: mapData.east, rotation: mapData.rotation, radius: mapData.radius});
        return await sendMapInfoToESP(json,type);
    }

    async function clearMap(){
        let serverHost = getServerHost();
        setMapData({...mapData, id: mapData.id, name: "Click here to add map", country: "NoMap", area: "NoMap", pngFile: "NoMap.png", kmlFile: "NoMap.kml", radius: 63713000});
        let json = JSON.stringify({id: mapData.id, name: "Click here to add map", country: "NoMap", area: "NoMap", pngFile: mapData.pngFile, kmlFile: mapData.kmlFile, radius: mapData.radius});
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

    async function saveChangesSelectedMap(){
        setEditMap(false);
        const response = await sendMapInfo("update");
        console.log(response[0]);
        setSuccess(response[1]);
        setError(response[2]);
    }

    async function useSelectedMap() {
        const response = await requestMap(mapData, kmlUploaded);
        //console.log(response[0].data);
        setMapData(response[0].data);
        setHomeToUseMap(response[0].data);
        setSuccess(response[1]);
        setError(response[2]);
        setUseMap(true);
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
        // console.log(event?.target?.value);
        if (event.target.name === "name") {
            setMapData({...mapData, name: value});
        }
        if (event.target.name === "country") {
            setMapData({...mapData, country: value});
        }
        if (event.target.name === "area") {
            setMapData({...mapData, area: value});
        }
        if (event.target.name === "radius") {
            setMapData({...mapData, radius: value});
        }
    };

    function setEditMapToFalse(){
        setEditMap(false);
    }

    useEffect( () => {
        setMapData(map);
        setLoading(false);
    },[]);

    useEffect(() => {
        if (useMap) {
            // console.log("navigate to usemap");
            navigate("../use-map", { state: {mapData} });   //id: map.id, name: map.name, country: map.country
        }
      }, [useMap]);

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
            <label className={styles['info-label']} htmlFor="radius">World Map Radius (m): </label>
            {(editMap) ? (
                <input className={styles['info-input']} name="radius" type="text" id="radius" defaultValue={mapData.radius} onChange={handleInputUpdate}/>
            ) : (
                <div className={styles['valueRO-info-button']}>
                <div id={styles['valueRO-numberplate']}>{mapData.radius}</div>
                </div>
            )}
            {(!editMap) ? (<>
                            <label className={styles['info-label']} htmlFor="mapPNGFile">Map (.png): </label>
                            <label className={styles['numberRO']} htmlFor="mapPNGFile">{mapData.pngFile} </label>
                          </>
                ) : ((loading) ? (<></>) : (
                <>
                    <label className={styles['info-label']} htmlFor="mapPNGFile">Map PNG({mapData.pngFile}) </label>
                    <FilePicker maxSize={maxFileSize}
                                extensions={['png']}
                                onChange={FileObject => (uploadMapFile(FileObject)).then(r => {
                                    processFileData(r[0], r[1]);})}
                                onError={errMsg => (setError(errMsg))}>
                        <button type="button">
                            Upload PNG map file
                        </button>
                    </FilePicker>
                </>
                ))
            }
            {(!editMap) ? (<>
                            <label className={styles['info-label']} htmlFor="kmlFile">KML map: </label>
                            <label className={styles['numberRO']} htmlFor="mapPNGFile">{mapData.kmlFile} </label>
                            </>) : (
                    (!pngUploaded) ? (<></>) : ((loading)? (<></>): (
                        <>
                        <label className={styles['info-label']} htmlFor="kmlFile">KML map {mapData.kmlFile} </label>
                        <FilePicker extensions={['kml']}
                                    onChange={FileObject => (uploadMapFile(FileObject)).then(r => {processFileData(r[0], r[1]);})}
                                    onError={errMsg => (setError(errMsg))}>
                            <button type="button">
                                Upload KML map file
                            </button>
                        </FilePicker>
                        </>
                        )
                    )
                )
            }
            {(editMap) ? ( 
                (!kmlUploaded) ? 
                    ((loading) ? (<></>): (
                        <>
                            <button className={styles['apply-button']} onClick={saveChangesSelectedMap} type="button"> Save Changes</button>
                            <div className={styles['empty-grid-space-4']}/>
                            <button className={styles['apply-button']} onClick={setEditMapToFalse} type="button"> Cancel</button>
                        </>
                    )
                    ):( (loading)? (<></>): (
                        <>
                            <button className={styles['apply-button']} onClick={saveChangesSelectedMap} type="button"> Save Changes</button>
                        </>)
                    )
            ): (
                (mapData.area === "NoMap") ? (        
                    <>
                        <button className={styles['apply-button']} onClick={editSelectedMap} type="button"> Edit Map</button>
                    </>            
                ) : (
                    <>
                        <button className={styles['apply-button']} onClick={editSelectedMap} type="button"> Edit Map</button>
                        <button className={styles['apply-button']} onClick={useSelectedMap} type="button"> Use Selected Map</button>
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