import React from "react";

export default function SubHeader({title, nrOfRecords}){
    return(
        <h2> {title} ({nrOfRecords})</h2>
    );
}