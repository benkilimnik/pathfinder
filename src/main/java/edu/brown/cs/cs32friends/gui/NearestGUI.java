package edu.brown.cs.cs32friends.gui;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import com.google.gson.JsonObject;
import edu.brown.cs.cs32friends.maps.MapsDatabase;
import edu.brown.cs.cs32friends.maps.NearestMap;
import org.json.JSONArray;
import org.json.JSONException;
import spark.Request;
import spark.Response;
import spark.Route;
import org.json.JSONObject;

/**
 * Sample nearest GUI
 */
public class NearestGUI implements Route {

  @Override
  public Object handle(Request request, Response response) throws Exception {

    double[] inputCoords = {0.0, 0.0};
    double[] nearestCoords = {0.0, 0.0};

    try {
      // parse request as JSON
      JSONObject json = new JSONObject(request.body());

      // get lat/lon of input node from frontend
      JSONArray nearestArray = json.getJSONArray("nearest");
      inputCoords[0] = nearestArray.getDouble(0);
      inputCoords[1] = nearestArray.getDouble(1);

      // initialize mapfinder with lat, lon
      NearestMap mapfinder = new NearestMap(new double[] {
          inputCoords[0], inputCoords[1]
      });

      // call nearest
      mapfinder.nearestFind(MapsDatabase.getMapTree());
      // return lat/lon of nearest node to frontend
      nearestCoords[0] = mapfinder.getBestNode().getLat();
      nearestCoords[1] = mapfinder.getBestNode().getLong();


    } catch (JSONException e) {
      e.printStackTrace();
    }
//    List<JsonObject> nearestCoordsJson = new ArrayList<>();
//    nearestCoordsJson.add(nearestCoords[0].toJson());
//    nearestCoordsJson.add(nearestCoords[1].toJson());
    Gson gson = new Gson();
    Map<String, double[]> nearestMap = ImmutableMap.of("node", nearestCoords);
    return gson.toJson(nearestMap);
  }
}
