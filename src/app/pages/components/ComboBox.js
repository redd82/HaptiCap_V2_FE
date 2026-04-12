import React, {useEffect} from 'react';
import styles from '../../styles/components/ComboBox.module.css'

export default function ComboBox(props) {
    //console.log(props)
    return(
        <>
            <select className={styles.comboBox} name={props.name} onChange={props.handleChange}>
                {(props.newItem) ? (
                    <option key="0" >Select Item</option>
                ) : ( <option key={props.list.id}>{props.selected}</option>)
                }
                {props.list.map((item) => (
                    <option key={props.list.id}>{item.itemName}</option>
                ))}
            </select>
        </>
    );
}