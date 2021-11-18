import TextBox from "./Textbox";
import React, {useState} from 'react';

import axios from "axios";
import { AwesomeButton } from "react-awesome-button";

function Route() {
    const [startLat, setStartLat] = useState(0);
    const [endLat, setEndLat] = useState(0);
    const [startLong, setStartLong] = useState(0);
    const [endLong, setEndLong] = useState(0);
    const [startRoute, setRoute] = useState([[0, 0], [0, 0], [0, 0], [0, 0]])



    /**
     * Makes an axios request.
     */
    const requestRoute = () => {
        const toSend = {
            streetsProvided : false,
            sourceCoords : [startLat, startLong],
            destinationCoords : [endLat, endLong]
        };

        let config = {
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*',
            }
        }
        //Install and import this!
        axios.post(
            'http://localhost:4567/route',
            toSend,
            config
        ).then(response => {
            console.log(response.data);
            setRoute(response.data["route"]);
        }).catch(function (error) {
            console.log(error);
        });
    }


    return (
        <div className="Route">
            <header className="Route-Header"><h1>Route Header</h1></header>
            {/*<TextBox label={"Start Latitude: "} text={startRoute[2][0]} change={setStartLat}/>*/}
            {/*<TextBox label={"Start Longitude: "} text={startRoute[2][1]} change={setStartLong}/>*/}
            {/*<TextBox label={"End Latitude: "} text={startRoute[3][0]} change={setEndLat}/>*/}
            {/*<TextBox label={"End Longitude: "} text={startRoute[3][1]} change={setEndLong}/>*/}
            <AwesomeButton onPress={requestRoute}>Get Route</AwesomeButton>
        </div>
    )
}

export default Route;