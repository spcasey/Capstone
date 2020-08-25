// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package com.google.sps.servlets;

import java.util.*;
import java.util.List;
import java.util.ArrayList;
import com.google.gson.Gson;
import org.json.JSONObject;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/*Servlet that gets COVID count data from NYT*/
@WebServlet("/getCountyData")
public class getNYTDataServlet extends HttpServlet {
  private String NYT_DATA_LINK =
      "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Map<String, Map<String, String>> counties = new HashMap<String, Map<String, String>>();
    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
    URL url = new URL(NYT_DATA_LINK);
    try {
      HttpURLConnection url_connect = (HttpURLConnection) url.openConnection();
      url_connect.setRequestMethod("GET");
      int code = url_connect.getResponseCode();
      reader = new BufferedReader(new InputStreamReader(url_connect.getInputStream()));

      String input = reader.readLine();
      Map<String, String> states_visited = new HashMap<String, String>();
      int states_count = 0;
      while (input != null) {
        String parsed_data[] = input.split(",");
        if (parsed_data.length >= 6) {
          String date = parsed_data[0];
          String county = parsed_data[1];
          String state = parsed_data[2];
          String fips = parsed_data[3];
          String cases = parsed_data[4] + "";
          String deaths = parsed_data[5] + "";
          String key = county + "-" + fips;

          Map<String, String> county_data = new HashMap<String, String>();
          county_data.put("date", date);
          county_data.put("county", county);
          county_data.put("state", state);
          county_data.put("fips", fips);
          county_data.put("cases", cases);
          county_data.put("deaths", deaths);
          counties.put(key, county_data);
        }
        input = reader.readLine();
      }
    } catch (Exception e) {
      counties.put("error", new HashMap<String, String>());
    } finally {
      reader.close();
    }

    String json = new Gson().toJson(counties);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
}
