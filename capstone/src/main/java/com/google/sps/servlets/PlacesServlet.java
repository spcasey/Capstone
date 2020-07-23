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

/* Servlet that handles getting establishments*/
@WebServlet("/getPlaces")
public class PlacesServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String lat = request.getParameter("lat");
    String lng = request.getParameter("lng");
    String radius = request.getParameter("radius");
    String link = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="
      + lat + "," + lng + "&radius=" + radius + "&key=AIzaSyCgozira2dGlwMHT_WgQpmg84fk3VhRglM";
    String places_string = "";
    URL url = new URL(link);
    HttpURLConnection url_connect = (HttpURLConnection) url.openConnection();
    url_connect.setRequestMethod("GET");
	int code = url_connect.getResponseCode();
    if(code == HttpURLConnection.HTTP_OK){ //status 200 success
	  BufferedReader reader = new BufferedReader(new InputStreamReader(url_connect.getInputStream()));
	  StringBuffer data = new StringBuffer();
      String input = reader.readLine();
      while(input != null) {
		data.append(input);
        input = reader.readLine();
	  }
	  reader.close();
      places_string = data.toString();
	}else{
	  //git request failed, send issue dictionary
      places_string = "{\"error\": \"yes\"}";
	}
    //System.out.println(places_string);
    String json = new Gson().toJson(places_string);
    response.setContentType("application/json");
    response.getWriter().println(json);
    //response.sendRedirect("/index.html");
  }
}