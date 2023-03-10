import React, {useContext} from 'react';
import styles from '../../styles/Content.module.css';
import {useLocation} from "react-router-dom";
import {CommsContext} from "../../contexts/CommsContext";

// info:
//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy
// incase the boolean html is set, output the text to the html element
// <p id="ClickedCoordinates">Coordinates:</p>
// if(html)
// {
//     document.getElementById("ClickedCoordinates").innerHTML = "Coordinates X:" + x + " Y:" + y;
// }

export default function UseMap(){
    const {getServerHost} = useContext(CommsContext);
    const location = useLocation();
    const { mapData } = location.state;
    console.log(mapData);

    function CalculateImageCoords(event, html) {
        try{
            let x = event.clientX;
            let y = event.clientY;
            let coordinates = [x,y];
            console.log("CalculateImageCoords; Input: " + event);
            console.log("CalculateImageCoords; Output: X:" + x + " Y:" + y);
            return coordinates; 
        }
        catch(exception){
            let error = [-99,-99]; // set values to -99 as to denote an error but not return a null value
            console.log("CalculateImageCoords; " + exception);
            console.log("CalculateImageCoords; Input: " + event);
            console.log("CalculateImageCoords; Output: ERROR - X:-99 Y:-99");
             return error;
        }
      }

    return(
        <div>
            <img className={styles['map']} src={getServerHost() + mapData.pngFile} alt="" onClick={CalculateImageCoords}></img>
        </div>
    );
}