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
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String link = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv";
    URL url = new URL(link);
    HttpURLConnection url_connect = (HttpURLConnection) url.openConnection();
    url_connect.setRequestMethod("GET");
    int code = url_connect.getResponseCode();
    List<String> county_data = new ArrayList<String>();
    if(code == HttpURLConnection.HTTP_OK){ 
      BufferedReader reader = new BufferedReader(new InputStreamReader(url_connect.getInputStream()));
      String input = reader.readLine();
      while(input != null) {
        input = reader.readLine();
        county_data.add(input);
      }
      reader.close();
    }else{
      county_data.add("error");
    }
    String json = new Gson().toJson(county_data);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
}