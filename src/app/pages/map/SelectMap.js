import React from "react";
import '../../styles/Content.module.css';
import {useLocation} from "react-router-dom";
import MapInputForm from "./MapInputForm";



export default function SelectMap({title}){
    const location = useLocation();
    const { map } = location.state;
    return(
       <>
        <h1>{title}</h1>
           <MapInputForm map={map} newMap={false}/>
       </>
    );
}