import {useEffect, useRef} from "react";
// import Canvas from "./Canvas"
import {useState} from "react";
import Canvas from "./Canvas.js";

/**
 * Handles requesting boxes of ways from the backend, routes between points, and the nearest node to a coordinate or at
 * the intersection of two roads.
 */
function Map() {

    // initial map view
    const INIT_MIN_LON = -71.407971
    const INIT_MAX_LON = -71.392231
    const INIT_MIN_LAT = 41.823142
    const INIT_MAX_LAT = 41.828147

    // ways to pass the canvas
    const canvasWays = useRef([null])

    // stores an object of way boxes
    const [waysCache, setWaysCache] = useState({})
    // whether or not the ways have been fetched yet (used for whether to draw or not)
    const [waysFetched, setWaysFetched] = useState([null]) //used to be false in useState()
    // whether or not there are ways loading
    const [loading, setLoading] = useState(true)

    // the current map view
    const [mapView, setMapView] = useState({
        "northwest": [INIT_MAX_LAT, INIT_MIN_LON],
        "southeast": [INIT_MIN_LAT, INIT_MAX_LON]
    })

    useEffect(() => {
        requestWays().then(ways => {
            setWaysFetched(ways)
            //canvasWays.current = ways
            console.log(waysFetched)
            setLoading(false)
        })
    }, [mapView])

    /**
     * Request initial ways from backend.
     * ;@returns {Promise<unknown>}
     */
    async function requestWays() {
        return new Promise((resolve, reject) => {
            fetch('http://localhost:4567/ways', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    northwest: [INIT_MAX_LAT, INIT_MIN_LON],
                    southeast: [INIT_MIN_LAT, INIT_MAX_LON]
                })
            }).then(response => response.json())
                .then(response => {
                    if ("error" in response) {
                        if (response.error === undefined) {
                            alert("An error occurred")
                        } else {
                            alert(response.error)
                        }
                        reject()
                    } else {
                        resolve({
                            "ways": response.ways
                        })
                    }
                })
        })
    }


    return (
        <div>
            <div className="flex justify-center">
                <Canvas loading={loading} ways={canvasWays} waysFetched={waysFetched}
                        mapView={mapView} setMapView={setMapView}/>
            </div>
        </div>
    )
}

export default Map;