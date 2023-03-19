import React, {createContext, useState} from 'react';

export const DebugContext = createContext({});
export default function DebugContextProvider({ children }) {
    const [debug, setDebug] = useState(1)               // Set debug level

    function debugLevel(level){
        setDebug(level);
    }

    // New Debug
    // message and values are both arrays, where the message value is the string (the log message) and the values array item holds the data value at the same index.
    // i.e. message[1]  has the string value "Function weather report; Output; the temperature in degrees celcius is" 
    //      values[1]   "2" 
    function SystemDebug(debugmessage,debugvalues)
    {
            let mi = debugmessage.length;    // items count in message[]
            let vi = debugvalues.length;     // item count in values[]
    
        try{        // use try-catch to be safe.....
    
        if(debug === 1) // this level of debug dumps the message AND the values to the console log; sorted if possible, unsorted if needed.
        {
            // check if the arrays have an equal length
            if(mi === vi) //the are equal, its safe to proceed with the entire list!!!
            {
                for (let i=0; i < debugvalues.length; i++)
                {
                    console.log(debugmessage[i] + ": " + debugvalues[i]); // write the messge and the values to the log
                }
    
            }
            if(mi !== vi)
            {
                console.log("System Debug encountered a small error, we are missing one or more messages or values.");
                console.log("System Debug will now dump the raw inputs for the sysmin to sort.");
                console.log(debugmessage);
                console.log(debugvalues);
            }
    
        }
        if(debug === 2) // this debug level dumps only the values to the console.log
        {
            for (let i=0;i< debugvalues.length; i++)
            {
                console.log(debugvalues[i]);
            }
    
        }
    
        // add additional Debug levels like "write to log file"
    
        }
        catch(exception) // okay something went horribly wrong;
        {
            console.log("This error was so huge the debugger couldn't handle it: ");
            console.log(exception);
        }
    }

    const contextData = 
    {
        SystemDebug:SystemDebug,
        debugLevel:debugLevel,
    }
    
    return (
        <DebugContext.Provider value={contextData}>
            {children}
        </DebugContext.Provider>
    );
}