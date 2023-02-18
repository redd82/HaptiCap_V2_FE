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

export default function MapInputForm({map, newMap}) {
    const DATEFORMAT = 'yyyy-MM-dd';
    const {fetchMapList} = useContext(MapsContext);
    const {sortNames } = useContext(UtilityContext);
    const {parseDate, formatDate } = useContext(DateContext);
    const {storeData, fetchData, getServerHost} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [mapData, setMapData] = useState(map);
    let newFaultTemp = {};


    async function onSubmit(data){
        // let serverHost = getServerHost();
        // if(newCar){
        //     console.log(carDocDetails);
        //     let json = JSON.stringify({documentNr: carDocDetails.documentNr, filePath:carDocDetails.filePathName, inspectionCode: carDocDetails.inspectionCode,
        //         firstRegistrationDate: carDocDetails.firstRegistrationDate, lastOwnerChangeDate: carDocDetails.lastOwnerChangeDate, numberOrCompanyName: carDocDetails.numberOrCompanyName,
        //         registrationType: carDocDetails.registrationType, car: {brand:carData.brand, model:carData.model, year:carData.year, version:carData.version, nrOfDrivenKMs:carData.nrOfDrivenKMs,
        //             numberPlate:carData.numberPlate, lastCheckupDate: carData.lastCheckupDate, workFinishedDate:carData.workFinishedDate}});
        //     console.log(json);
        //    try{
        //         const response = await axios.post(serverHost + '/api/cars/documents/add', json, {
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Authorization: `Bearer ${getJWT()}`,
        //             },
        //         });
        //         setError("");
        //         setSuccess(response.data.message);
        //     }   catch (e){
        //         console.log(e.response.data.message);
        //         setError(e.response.data.message);
        //         if(e.response.status >= 401) {
        //             console.log(e.response);
        //             logout();
        //         }else if(e.response.status === 400){
        //             console.log(e.response.data.message);
        //             setError(e.response.data.message);
        //         }
        //     }
        // }else{
        //     setCarDocDetails({...carDocDetails,registrationType: "Customer"});
        //     console.log(data);
        //     let json = JSON.stringify({documentNr: carDocDetails.documentNr, filePathName:data.filePathName, inspectionCode: carDocDetails.inspectionCode,
        //         firstRegistrationDate: carDocDetails.firstRegistrationDate, lastOwnerChangeDate: carDocDetails.lastOwnerChangeDate, numberOrCompanyName: carDocDetails.numberOrCompanyName,
        //         registrationType: carDocDetails.registrationType, carDTO: {id: carData.id, brand:carData.brand, model:carData.model, year:carData.year, version:carData.version,
        //         nrOfDrivenKMs:carData.nrOfDrivenKMs, numberPlate:carData.numberPlate, lastCheckupDate: carData.lastCheckupDate, broughtInDate: carData.broughtInDate,
        //         workFinishedDate:carData.workFinishedDate}});
        //     console.log(json);
        //     try{
        //         const response = await axios.put(serverHost + '/api/cars/documents/updateDocument', json, {
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Authorization: `Bearer ${getJWT()}`,
        //             },
        //         });
        //         setError("");
        //         setSuccess(response.data.message);
        //     }   catch (e){
        //         setError(e.response.data.message);
        //         if(e.response.status >= 401) {
        //             logout();
        //         }else if(e.response.status === 400){
        //             setError(e.response.data.message);
        //         }
        //     }
        // }
    }

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
                const response = await axios.post(serverHost + '/api/file-upload', formData, {
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
            setError("Filename doesn't match document number!");
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
        // if (event.target.name === "documentNr") {
        //     setCarDocDetails({...carDocDetails, documentNr: value});
        // }
        // if (event.target.name === "filePathName") {
        //     setCarDocDetails({...carDocDetails, filePathName: value});
        // }
        // if (event.target.name === "inspectionCode") {
        //     setCarDocDetails({...carDocDetails, inspectionCode: value});
        // }
        // if (event.target.name === "documentNr") {
        //     setCarDocDetails({...carDocDetails, documentNr: value});
        // }
        // if (event.target.name === "numberPlate") {
        //     setCarData({...carData, numberPlate: value});
        // }
        // if (event.target.name === "brand") {
        //     setCarData({...carData, brand: value});
        // }
        // if (event.target.name === "model") {
        //     setCarData({...carData, model: value});
        // }
        // if (event.target.name === "year") {
        //     setCarData({...carData, year: value});
        // }
        // if (event.target.name === "version") {
        //     setCarData({...carData, version: value});
        // }
        // if (event.target.name === "nrOfDrivenKMs") {
        //     setCarData({...carData, nrOfDrivenKMs: value});
        // }
    };

    useEffect( () => {
        if(newMap) {
            setReadOnly(false);
            setMapData({id: 0, name: "", country: "", mapFile: "", kmlFile: ""});
            // fetchMapList().then(r => setMapList(extractCustomerNrs(r)));
        }else{
            // getCarDataByNumberPlate(numberPlate).then(r => {
            //     console.log(r);
            //     if(r) {
            //         console.log(r);
            //         getCustomerData(r.numberOrCompanyName).then (cr => {
            //             console.log(cr);
            //             setOwnerData(cr);
            //         })
            //         setCarDocDetails(r);
            //         setCarData(r.carDTO);
            //         setCarFaultList( r.carDTO.faults);
            //         console.log(r.carDTO.faults);
            //     } else {
            //         console.log("no data found");
            //     }
            // });
        }
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']} onSubmit={handleSubmit(onSubmit)}>
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
            <label className={styles['info-label']} htmlFor="model">Country: </label>
            {(readOnly) ? (<div className={styles['ROdata']}> {mapData.country}</div>) : (
                <input className={styles['info-input']} name="model" type="text" id="model" defaultValue={mapData.country}
                       onChange={handleInputUpdate}/>
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