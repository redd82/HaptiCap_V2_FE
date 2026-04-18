import React, {useContext, useEffect, useState} from "react";
import {
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import MapData from "./components/MapData"
import SubHeader from "../components/SubHeader";
import {MapsContext} from "../../contexts/MapsContext";

export default function MapList({title}){
    const {fetchMapList} = useContext(MapsContext);
    const [mapList, setMapList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(true);
    let noMapDisplayed = false;

    useEffect( () => {
        fetchMapList().then(r => {
            if (typeof r.data.maps !== 'undefined'){
                setMapList(r.data.maps);
            }else{
                setMapList([]);
            }
            setTimeout(() => {
                setLoading(false);
              }, 1000);
            //console.log(r);
        });
        
    }, [fetchMapList]);

    return(
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : ( (mapList.length === 0) ? (<Typography>No maps in list...</Typography>) :(
            <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3 }}>
                <TextField
                    label="Country"
                    type="text"
                    name="search"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                />
                <SubHeader title={title} nrOfRecords={mapList.length}/>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>id</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Country</TableCell>
                                <TableCell>Area</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mapList
                                .filter(map => map.country.match(new RegExp(searchValue, "i")))
                                .map(map => {
                                    if (map.name === "Click here to add map") {
                                        if (noMapDisplayed) {
                                            return null;
                                        }
                                        noMapDisplayed = true;
                                    }
                                    return (
                                        <MapData key={map.id} id={map.id} map={map}/>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            )
             )}
        </Box>
    );
}

