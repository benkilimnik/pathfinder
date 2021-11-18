package edu.brown.cs.cs32friends.gui;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import edu.brown.cs.cs32friends.graph.Graph;
import edu.brown.cs.cs32friends.graph.GraphSourceParser;
import edu.brown.cs.cs32friends.graph.ValuedEdge;
import edu.brown.cs.cs32friends.graph.search.AStar;
import edu.brown.cs.cs32friends.graph.search.GraphSearch;
import edu.brown.cs.cs32friends.graph.search.heuristic.HaversineHeuristic;
import edu.brown.cs.cs32friends.handlers.maps.MapsHandler;
import edu.brown.cs.cs32friends.handlers.maps.RouteHandler;
import edu.brown.cs.cs32friends.main.ParseCommands;
import edu.brown.cs.cs32friends.maps.MapNode;
import edu.brown.cs.cs32friends.maps.MapsDatabase;
import edu.brown.cs.cs32friends.maps.NearestMap;
import edu.brown.cs.cs32friends.maps.Way;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Route;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Sample nearest GUI
 */
public class RouteGUI implements Route {
  private static Graph<MapNode, Way> graph;
  private static GraphSearch<MapNode, Way> searcher = new AStar(
      new HaversineHeuristic());
  private static GraphSourceParser parser;

  @Override
  public Object handle(Request request, Response response) throws Exception {

    // lat, lon of source and destination
    double[] source = {0.0, 0.0};
    double[] destination = {0.0, 0.0};
    // street names
    String street1, cross1, street2, cross2;
    // directions to destination, each step has [srcLat, srcLong, destLat, destLong]
    ArrayList<double[]> directions = new ArrayList<double[]>();

    try {
      // parse request as JSON
      JSONObject json = new JSONObject(request.body());
      System.out.println("RECEIVED");
      System.out.println(json);

      // check if given coords or streets
      if (json.getString("streetsProvided").equals("false")) {
        // get lat/lon of input node from frontend
        JSONArray sourceArray = json.getJSONArray("sourceCoords");
        JSONArray destinationArray = json.getJSONArray("destinationCoords");
        source[0] = sourceArray.getDouble(0);
        source[1] = sourceArray.getDouble(1);
        destination[0] = destinationArray.getDouble(0);
        destination[1] = destinationArray.getDouble(1);

        NearestMap finder = new NearestMap(new double[] {
            source[0], source[1]
        });

        finder.nearestFind(MapsDatabase.getMapTree());
        String start = finder.getBestNode().getID();
        finder = new NearestMap(new double[] {
            destination[0], destination[1]
        });
        finder.nearestFind(MapsDatabase.getMapTree());
        String end = finder.getBestNode().getID();

        // Performs the graph search
        if (start != null && end != null) {
          directions = RouteGUI.findRoute(start, end);
        } else {
          System.out.println("ERROR: Invalid start or end node.");
        }
      } else {
        street1 = json.getJSONArray("streets").getString(0);
        cross1 = json.getJSONArray("streets").getString(1);
        street2 = json.getJSONArray("streets").getString(2);
        cross2 = json.getJSONArray("streets").getString(3);

        // Gets the start and end node for the search
        String start = MapsHandler.getMapData().getIntersection(street1,
            cross1);
        String end = MapsHandler.getMapData().getIntersection(street2,
            cross2);

        // Performs the search
        if (start != null && end != null) {
          directions = RouteGUI.findRoute(start, end);
        } else {
          System.out.println("ERROR: Invalid start or end node." + System.lineSeparator());
        }
      }

    } catch (JSONException e) {
      e.printStackTrace();
    }
    System.out.println(directions.size());
    Gson gson = new Gson();
    Map<String, Object> wayMap = ImmutableMap.of("route", directions);
    return gson.toJson(wayMap);
  }

  private static ArrayList<double[]> findRoute(String start, String end) {
    // a list of coordinate quads for each step in the directions, [srcLat, srcLong, destLat, destLong]
    ArrayList<double[]> coordQuads = new ArrayList<double[]>();
    parser = MapsHandler.getGraphSource();
    graph = MapsHandler.getGraph();
    MapNode startNode = parser.getVertexValue(start);
    MapNode endNode = parser.getVertexValue(end);
    List<ValuedEdge<MapNode, Way>> path = searcher
        .search(graph.getVertex(startNode), endNode);
    for (ValuedEdge<MapNode, Way> e : path) {
      // send the quads of [srcLat, srcLong, destLat, destLong] back as a list of coordinates
      double[] quad = {0.0, 0.0, 0.0, 0.0};
      quad[0] = e.getSource().getValue().getLat();
      quad[1] = e.getSource().getValue().getLong();
      quad[2] = e.getDest().getValue().getLong();
      quad[3] = e.getDest().getValue().getLong();
      coordQuads.add(quad);
    }
    return coordQuads;
  }
}