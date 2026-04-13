import React from "react";
import { Paper, Typography } from '@mui/material';
import {useLocation} from "react-router-dom";
import MapInputForm from "./MapInputForm";



export default function SelectMap({title}){
    const location = useLocation();
    const { map } = location.state;
    return(
       <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
           <MapInputForm map={map} newMap={false}/>
       </Paper>
    );
}