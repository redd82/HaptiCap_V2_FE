import React, {createContext, useContext, useEffect} from 'react';

export const UtilityContext = createContext({});
export default function UtilityContextProvider({ children }) {
    const DATEFORMAT = 'yyyy-MM-dd';

    function sortNamesByNumberOrName(items) {
        items.sort(function (a, b) {
            const nameA = a.numberOrName.toUpperCase();
            const nameB = b.numberOrName.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return items;
    }

    function sortNamesByLastName(items) {
        items.sort(function (a, b) {
            const nameA = a.lastName.toUpperCase();
            const nameB = b.lastName.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return items;
    }

    function sortNamesByFirstName(items) {
        items.sort(function (a, b) {
            const nameA = a.firstName.toUpperCase();
            const nameB = b.firstName.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return items;
    }

    function sortData(responseData){
        return responseData.sort((a, b) => a.id > b.id ? 1 : -1);
    }

    function extractItems(sortedItems){
        console.log(sortedItems)
        let types = [];
        for(let i = 0; i < sortedItems.length; i++){
            types[i] = {id: i, itemName: sortedItems[i]};
        }
        return types;
    }

    useEffect( () => {

    }, []);

    const contextData = {
        sortNamesByLastName:sortNamesByLastName,
        sortNamesByFirstName:sortNamesByFirstName,
        sortNamesByNumberOrName:sortNamesByNumberOrName,
        sortData:sortData,
        extractItems:extractItems,
    };

    return (
        <UtilityContext.Provider value={contextData}>
            {children}
        </UtilityContext.Provider>
    );
}