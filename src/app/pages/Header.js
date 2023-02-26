import React from "react";
import '../styles/Header.css';

export default function Header({title, time, date}){
    return(
        <div className="header-area">
            <header className="header">
                <h1>{title}</h1>
            </header>
            <div className="time-date">{time} - {date}</div>
        </div>
    );
}