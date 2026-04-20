import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "../pages/Home";
import MapList from "../pages/map/MapList";
import NewMap from "../pages/map/NewMap";
import SelectMap from "../pages/map/SelectMap";
import UseMap from "../pages/map/UseMap";
import Settings from "../pages/settings/System";
import SettingsInputForm from "../pages/settings/SettingsInputForm";
import DebugInputForm from "../pages/settings/DebugInputForm";
import CalibrationInputForm from "../pages/settings/CalibrationInputForm";
import TAKInputForm from "../pages/settings/TAKInputForm";
import Navigation from "../pages/map/Navigation";
import SystemForm from "../pages/settings/SystemForm";
import Waypoints from "../pages/map/Waypoints";

export default function Routing(){
    return(
        <div>
            <Routes>
                <Route path="*" element={<Home title="Home"/>}/>
                <Route path="/navigation" element={<Navigation title="Navigation"/>} >
                    <Route path="map-list" element={<MapList title="Map list" />} />
                    <Route path="new-map" element={<NewMap title="Install New Map"/>} />
                    <Route path="select-map" element={<SelectMap title="Map"/>} />
                    <Route path="use-map" element={<UseMap title="Map"/>} />
                    <Route path="waypoints" element={<Waypoints title="Waypoints current map"/>} />
                </Route>
                <Route path="/system" element={<Settings title="System"/>}>
                    <Route path="system-info" element={<SystemForm title="System Info" />} />
                    <Route path="debugform" element={<DebugInputForm title="Debugging" />} />
                    <Route path="settingsform" element={<SettingsInputForm title="HaptiCap Settings" />} />
                    <Route path="calibrationform" element={<CalibrationInputForm title="Calibration" />} />
                    <Route path="tak" element={<TAKInputForm title="TAK Package Import" />} />
                </Route>
            </Routes>
        </div>
    );
}