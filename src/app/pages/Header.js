import React from "react";
import '../styles/Header.css';

export default function Header({title, time, date}){
    return(
        <div className="header-area">
            <header className="header">
                <h1>{title}</h1>
            </header>
            <div className="user-label">{time} - {date}</div>
        </div>
    );
}