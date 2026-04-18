import React from 'react';
import {useNavigate} from "react-router-dom";
import { TableCell, TableRow } from '@mui/material';

export default function MapData({id, map}) {
    const navigate = useNavigate();
    function handleClick(){
        navigate("../select-map", { replace: true, state: {map} });   //id: map.id, name: map.name, country: map.country
    }

    return (
        <TableRow
            key={map.id}
            hover
            onClick={handleClick}
            sx={{ cursor: 'pointer' }}
        >
            <TableCell width="10%">{map.id}</TableCell>
            <TableCell width="30%">{map.name}</TableCell>
            <TableCell width="30%">{map.country}</TableCell>
            <TableCell width="30%">{map.area}</TableCell>
        </TableRow>
    );
}