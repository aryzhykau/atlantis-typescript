import React from "react";
import {useState} from "react";


const Test: React.FC = () => {
    const [counter, setCounter] = useState(0);

    const increment = () => {
        setCounter(counter + 1);
    }

    const decrement = () => {
        setCounter(counter - 1);
    }
    return <div style={{display: "flex"}}>
        <button onClick={decrement}>-</button>
        <h1>{counter}</h1>
        <button onClick={increment}>+</button>
    </div>
}
export default Test;