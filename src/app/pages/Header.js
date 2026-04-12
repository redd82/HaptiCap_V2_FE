import React from "react";
import '../styles/Header.css';

export default function Header({title}){
    return(
        <div className="header-area">
            <header className="header">
                <h1>{title}</h1>
            </header>
        </div>
    );
}