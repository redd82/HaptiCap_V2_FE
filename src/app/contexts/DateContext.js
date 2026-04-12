import React, { createContext } from 'react';
import dateFnsFormat from "date-fns/format";
import {nl} from "date-fns/locale";
import dateFnsParse from "date-fns/parse";
import isDate from "date-fns/isDate";

export const DateContext = createContext({});
export default function DateContextProvider({ children }) {
    const DATEFORMAT = 'yyyy-MM-dd';

    function getDateFormat() {
        return DATEFORMAT;
    }

    function parseDate(date) {
        const parsed = dateFnsParse(date, getDateFormat(), new Date(), { locale: nl });
        if (isDate(parsed)) {
            return parsed;
        }
        return undefined;
    }

    function formatDate(date) {
        return dateFnsFormat(date, DATEFORMAT, { locale: nl });
    }

    const contextData = {
        formatDate:formatDate,
        parseDate:parseDate,
        getDateFormat:getDateFormat,
    };

    return (
        <DateContext.Provider value={contextData}>
            {children}
        </DateContext.Provider>
    );
}