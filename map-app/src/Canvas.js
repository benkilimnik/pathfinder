import {useEffect, useRef, useState} from "react";
import './Canvas.css';
import AwesomeButton from "react-awesome-button";

/**Yep, that's a good place to start your debugging. Is the backend server running?
 * Maybe try calling setWaysFetched from the original requestWays instead of in a separate .then()?
 * Also, try verifying that your requestWays is being called.
 */


function Canvas(props) {
    const canvasRef = useRef(null)
    const [startMouseX, setStartMouseX] = useState(0)
    const [startMouseY, setStartMouseY] = useState(0)
    const [endMouseX, setEndMouseX] = useState(0)
    const [endMouseY, setEndMouseY] = useState(0)
    const [startMouseLock, setStartMouseLock] = useState(0)
    const [endMouseLock, setEndMouseLock] = useState(1)

    const onMouseDown = (e) => {
        if ((startMouseLock === 0) && (endMouseLock === 1)) {
            setStartMouseX(e.clientX);
            setStartMouseY(e.clientY);
        }
        if (startMouseLock === 1 && endMouseLock === 0) {
            setEndMouseX(e.clientX);
            setEndMouseY(e.clientY);
        }
    }

    const lockStart = () => {
        setStartMouseLock(1)
        if ((endMouseLock === 1) && (endMouseX === 0)) {
            setEndMouseLock(0)
        }
    }

    const lockEnd = () => {
        setEndMouseLock(1)
    }

    const resetLock = () => {
        setStartMouseLock(0)
        setEndMouseLock(1)
        setStartMouseX(0)
        setStartMouseY(0)
        setEndMouseX(0)
        setEndMouseY(0)
    }

    const XYtoCoord = (coord, width, height, mapView) => {
        let northwest = mapView["northwest"]
        let southeast = mapView["southeast"]
        let minLat = southeast[0]
        let maxLong = southeast[1]
        let maxLat = northwest[0]
        let minLong = northwest[1]
        let coordy = (coord[1] / width) * (maxLong - minLong) + minLong
        let coordx = -1 * ((coord[0] / height) * (maxLat - minLat) - maxLat )
        return [coordx, coordy]
    }

    const coordToXY = (coord, width, height, mapView) => {
        let northwest = mapView["northwest"]
        let southeast = mapView["southeast"]
        let minLat = southeast[0]
        let maxLong = southeast[1]
        let maxLat = northwest[0]
        let minLong = northwest[1]
        let x = (coord[1] - minLong) / (maxLong - minLong) * width
        let y = (maxLat - coord[0]) / (maxLat - minLat) * height
        return [x, y]
    }


    const draw = (ctx, canvasWays, mapView) => {
        ctx.font = '16px Andale Mono'
        ctx.lineWidth = 1
        ctx.fillStyle = "white";
        let canvasWidth = 500
        let canvasHeight = 500
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        // ctx.fillRect(0, 0, Canvas.width, Canvas.height)
        ctx.beginPath()
        // array of ways
        console.log(canvasWays)

        for (let i = 0; i < canvasWays.ways.length; i++) {
            let way = canvasWays.ways[i]
            // way = way.toString()
            let lat1 =  way.nameValuePairs.startNode.nameValuePairs.latlon.values[0]
            let long1 = way.nameValuePairs.startNode.nameValuePairs.latlon.values[1]
            let lat2 = way.nameValuePairs.endNode.nameValuePairs.latlon.values[0]
            let long2 = way.nameValuePairs.endNode.nameValuePairs.latlon.values[1]
            let xy1 = coordToXY([lat1, long1], canvasWidth, canvasHeight, mapView)
            let xy2 = coordToXY([lat2, long2], canvasWidth, canvasHeight, mapView)
            ctx.moveTo(xy1[0], xy1[1])
            ctx.lineTo(xy2[0], xy2[1])
        }
        ctx.stroke()
    }

    useEffect(() => {
        // setResult(props.ways);
        if (canvasRef && !props.loading) {
            const ctx = canvasRef.current.getContext('2d')
            //console.log(props.waysFetched)
            draw(ctx, props.waysFetched, props.mapView)
        }
    }, [canvasRef, props.loading]);

    return (
        <div style={{border: "1px solid black", width: "min-content", height: "min-content"}}>
            <canvas ref={canvasRef} width={500} height={500} onMouseDown={onMouseDown}/>
            <span className="startX">Start X: {startMouseX}</span>
            <span className="startY">Start Y: {startMouseY}</span>
            <button onClick={lockStart}>Lock Start Position</button>
            <br/>
            <span className="endX">End X: {endMouseX}</span>
            <span className="endY">End Y: {endMouseY}</span>
            <button onClick={lockEnd}>Lock End Position</button>
            <br/>
            <button onClick={resetLock}>Reset Search</button>
            <br/>
            <button>Get Route</button>
        </div>
    )
}

export default Canvas