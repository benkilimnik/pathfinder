# README
This application enables users to navigate the city of `Providence, RI` as well as any other place whose map data is loaded in!

## Features
- Enables users to look up shortest routes directly by clicking on the map
- Allows users to look up locations by longitude and latitude and see the shortest path they can take to that location on the map
- Allows users to zoom in and out
- Provides screen-reader support for reading directions shown as text

<img width="800" alt="maps" src="https://user-images.githubusercontent.com/47846691/147619553-495bbf7d-d249-4c70-ab86-783883c0541a.png">

## Implementation
- Uses a KD-tree to support nearest-location and nearest-neighbor search
- Implements a “lazy-loading” version of Dijkstra’s algorithm to find routes
- Employs both server and client side caching to achieve better performance
- Has a backend written in Java (using Spark) and a frontend written in JavaScript (using React)

To build use:
`mvn package`


To run use:
`./run`

To start the server use:
`./run --gui [--port=<port>]`

To start the frontend use:
`yarn start`
