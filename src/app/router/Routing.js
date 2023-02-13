import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "../pages/Home";
import Maps from "../pages/map/Maps";
import MapList from "../pages/map/MapList";
import NewMap from "../pages/map/NewMap";
import SelectMap from "../pages/map/SelectMap";
import Settings from "../pages/settings/Settings";
import SettingsInputForm from "../pages/settings/SettingsInputForm";
import DebugInputForm from "../pages/settings/DebugInputForm";
import CalibrationInputForm from "../pages/settings/CalibrationInputForm";

export default function Routing(){
    return(
        <div>
            <Routes>
                <Route path="*" element={<Home title="Home"/>}/>
                <Route path="/maps" element={<Maps title="Maps"/>} >
                    <Route path="map-list" element={<MapList title="Map list" />} />
                    <Route path="new-map" element={<NewMap title="Install New Map"/>} />
                    <Route path="select-map" element={<SelectMap title="Selected Map"/>} />
                </Route>
                <Route path="/settings" element={<Settings title="Settings"/>}>
                    <Route path="debugform" element={<DebugInputForm title="Debugging" />} />
                    <Route path="settingsform" element={<SettingsInputForm title="HaptiCap Settings" />} />
                    <Route path="calibrationform" element={<CalibrationInputForm title="Calibration" />} />
                </Route>
            </Routes>
        </div>
    );
}