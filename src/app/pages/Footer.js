import React from "react";
import '../styles/Footer.css';
import styles from '../styles/Content.module.css';

export default function Footer(props){
    return(
        <footer className="footer">
            <table className={styles['standard-table']}>
                <tbody>
                    <tr>
                        <td className={styles['standard-td-5']}>Date: {props.date}</td>
                        <td className={styles['standard-td-5']}>Time: {props.time}</td>
                        <td className={styles['standard-td-25']}>Latittude: {props.lat}</td>
                        <td className={styles['standard-td-25']}>Longitude: {props.lon}</td>
                    </tr>
                </tbody>
            </table>
        </footer>
    );
}