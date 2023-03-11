import React, { useContext,useState, useEffect } from "react";
import '../styles/Footer.css';
import styles from '../styles/Content.module.css';
import {CommsContext} from "../contexts/CommsContext";

export default function Footer(props){
    const {storeData, fetchTimeDate, fetchPosition} = useContext(CommsContext);
    const [espTimeDate, setEspTimeDate] = useState({});
    const [espGPSPosition, setGPSPosition] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000});
    let tempTime = {GPSTime: '', GPSDate: ''};
    let timeDelayMin = 60000;
    let timeDelaySec = 1000;

    useEffect( () => {
        fetchTimeDate().then(r => {
            setEspTimeDate(r);
        });
        fetchPosition().then(r => {
            setGPSPosition(r);
        });        
        }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimeDate().then(r => {
                setEspTimeDate(r);
            });
            fetchPosition().then(r => {
                setGPSPosition(r);
            });
        }, timeDelayMin);
        return () => {
            clearInterval(interval);
        };
        }, []);

        useEffect(() => {
            const interval = setInterval(() => {
                fetchPosition().then(r => {
                    setGPSPosition(r);
                });
            }, timeDelaySec);
            return () => {
                clearInterval(interval);
            };
        }, []);

    return(
        <footer className="footer">
            <table className={styles['standard-table']}>
                <tbody>
                    <tr>
                        <td className={styles['standard-td-15']}>Date:<br/>{espTimeDate.GPSDate}</td>
                        <td className={styles['standard-td-5']}>Time:<br/>{espTimeDate.GPSTime}</td>
                        <td className={styles['standard-td-10']}>Latittude:<br/>{espGPSPosition.GPSLat.toFixed(8)}</td>
                        <td className={styles['standard-td-10']}>Longitude:<br/>{espGPSPosition.GPSLon.toFixed(8)}</td>
                    </tr>
                </tbody>
            </table>
        </footer>
    );
}