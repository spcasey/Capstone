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
package com.google.sps;

import java.util.List;
import java.util.ArrayList;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.sps.Flag;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.text.ParseException;

/*recieves user comment input and Datastores it*/
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  private static final DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

  /** Takes in the HTTP request and generates a Flag object to store into datastore. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String name = request.getParameter("place-name");
    String address = request.getParameter("place-address");
    String lat = request.getParameter("lat");
    String lng = request.getParameter("long");
    String userId = request.getParameter("userId");
    Date currentDate = Calendar.getInstance().getTime();

    addFlagToDatastore(name, address, lat, lng, userId, currentDate);

    response.sendRedirect("/home.html");
  }

  public Entity addFlagToDatastore(
      String name, String address, String lat, String lng, String userId, Date currentDate) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    if (lat.isEmpty() == false) {
      Entity entry = new Entity("Flag");
      entry.setProperty("userId", userId);
      entry.setProperty("name", name);
      entry.setProperty("address", address);
      entry.setProperty("lat", lat);
      entry.setProperty("long", lng);
      entry.setProperty("date", currentDate);
      datastore.put(entry);
      return entry;
    }
    return null;
  }

  /**
   * Reads all the entities from the datastore and passes it back as a json file to be converted
   * into flags to be displayed on the map.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Gson gson = new Gson();
    response.setContentType("application/json; charset=UTF-8");
    response.getWriter().println(gson.toJson(fetchFlags()));
  }

  public ArrayList<Flag> fetchFlags() {
    ArrayList<Flag> flags = new ArrayList<>();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query = new Query("Flag").addSort("date", SortDirection.DESCENDING);
    PreparedQuery results = datastore.prepare(query);
    for (Entity entity : results.asIterable()) {
      long id = entity.getKey().getId();
      String userId = (String) entity.getProperty("userId");
      String name = (String) entity.getProperty("name");
      String address = (String) entity.getProperty("address");
      String lat = (String) entity.getProperty("lat");
      String lng = (String) entity.getProperty("long");
      Date date = (Date) entity.getProperty("date");

      Flag flag = new Flag(id, userId, name, address, lat, lng, date);
      flags.add(flag);
    }
    return flags;
  }
}
