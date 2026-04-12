import React, {useContext, useEffect, useState} from "react";
import '../../styles/pages/Search.css';
import SearchBar from "./components/SearchBar";
import {StoreContext} from "../../contexts/StoreContext";

export default function Search(){
    const { storeData, fetchData } = useContext(StoreContext);
    const [ loadedPage, setLoadedPage] = useState('');

    // useEffect( () => {
    //     setLoadedPage(fetchData(1));
    //     console.log(loadedPage);
    // }, []);


    return(
        <div className="search">
            {/*<SearchBar />*/}
            <div> {loadedPage} </div>
        </div>
        // <SearchBar />
    );
}