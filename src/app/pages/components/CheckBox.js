import React from 'react';
import styles from '../../styles/components/Check-box.module.css'

export default function CheckBox(props) {
    return (
        <div className={styles['check-box']}>
            <label className={styles['check-box-label']} htmlFor="checkBox">{props.labelname}</label>
            <input id={props.id} name={props.name} className="check-box-input" type="checkbox" disabled={props.disabled} defaultChecked={props.defaultChecked}
                   onChange={(e) => {
                       props.parentCallback(e.target);
                   }}/>
        </div>
    );
}