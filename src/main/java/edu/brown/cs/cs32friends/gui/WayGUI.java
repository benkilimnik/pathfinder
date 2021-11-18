package edu.brown.cs.cs32friends.gui;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import edu.brown.cs.cs32friends.handlers.maps.MapsHandler;
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
public class WayGUI implements Route {

  @Override
  public Object handle(Request request, Response response) throws Exception {

    double[] northwest = {0.0, 0.0};
    double[] southeast = {0.0, 0.0};

    try {
      // parse request as JSON
      JSONObject json = new JSONObject(request.body());
      System.out.println("RECEIVED");
      System.out.println(json);

      // get lat/lon of input node from frontend
      JSONArray northwestArray = json.getJSONArray("northwest");
      JSONArray southeastArray = json.getJSONArray("southeast");
      northwest[0] = northwestArray.getDouble(0);
      northwest[1] = northwestArray.getDouble(1);
      southeast[0] = southeastArray.getDouble(0);
      southeast[1] = southeastArray.getDouble(1);

    } catch (JSONException e) {
      e.printStackTrace();
    }
    List<Way> ways = MapsHandler.getMapData().getWays(northwest[0],
        northwest[1], southeast[0], southeast[1]);
    System.out.println(ways.size());
    List<JSONObject> wayStrings = new ArrayList<>();
    for (Way way : ways) {
      String jsonInString = new Gson().toJson(way);
      System.out.println(jsonInString);
      wayStrings.add(new JSONObject(jsonInString));
      System.out.println(new JSONObject(jsonInString));
    }
    Gson gson = new Gson();
    Map<String, Object> wayMap = ImmutableMap.of("ways", wayStrings);
    return gson.toJson(wayMap);
  }
}