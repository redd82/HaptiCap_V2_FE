import React from "react";
import '../../styles/components/Searchbox.css';

export default function SearchBox({placeholder, handleChange}){
  return(
    <input
        className='search-box'
        type='search'
        placeholder={ placeholder }
        onChange={handleChange}
        />
  );
}