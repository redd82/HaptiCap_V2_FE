import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "../pages/Home";
import Maps from "../pages/map/Maps";
import MapList from "../pages/map/MapList";
import NewMap from "../pages/map/NewMap";
import SelectMap from "../pages/map/SelectMap";

export default function Routing(){
    return(
        <div>
            <Routes>
                <Route path="*" element={<Home title="Home"/>}/>
                <Route path="/maps" element={<Maps title="Maps"/>} >
                    <Route path="map-list" element={<MapList title="Map list" />} />
                    <Route path="new-map" element={<NewMap title="New Map Import"/>} />
                    <Route path="select-map" element={<SelectMap title="Selected Map"/>} />
                </Route>
            </Routes>
        </div>
    );
}