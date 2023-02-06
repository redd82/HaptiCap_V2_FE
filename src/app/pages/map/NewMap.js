import React from 'react';
import '../../styles/Content.module.css';
import MapInputForm from "./MapInputForm";

export default function NewMap({title}){

    return(
        <div>
            <h1>{title}</h1>
            <MapInputForm name={""} newMap={true}/>
        </div>
    );
}

