import React, {useState} from "react";

export default function SearchBar(){
    const [ searchQuery, setSearchQuery] = useState('');

    return(
        <form action="/" method="get">
            <label htmlFor="header-search">
                <span className="visually-hidden">Search</span>
            </label>
            <input
                value={searchQuery}
                onInput={e => setSearchQuery(e.target.value)}
                type="text"
                id="header-search"
                placeholder="Search page"
                name="search"
                />
            <button type="submit">Search</button>
        </form>
    );
}