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
import java.util.List;
import java.util.ArrayList;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.sps.data.Flag;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

/* Servlet that handles commenting functionality */
@WebServlet("/data")
public class DataServlet extends HttpServlet {
  /*recieves user comment input and Datastores it*/
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String name = request.getParameter("place-name");
    String address = request.getParameter("place-address");
    String lat = request.getParameter("lat");
    String lng = request.getParameter("long");
    long timestamp = System.currentTimeMillis();
    if(lat.isEmpty() == false){
      long time = System.currentTimeMillis();
      Entity entry = new Entity("Flag");
      entry.setProperty("name", name);
      entry.setProperty("address", address);
      entry.setProperty("lat", lat);
      entry.setProperty("long", lng);
      entry.setProperty("timestamp", timestamp);
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
      datastore.put(entry);
    }
    /*System.out.println(name);
    System.out.println(address);
    System.out.println(location);*/
    response.sendRedirect("/index.html");
  }

  @Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

		Query query = new Query("Flag").addSort("timestamp", SortDirection.DESCENDING);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery results = datastore.prepare(query);

		ArrayList <Flag> flags = new ArrayList < >();
		for (Entity entity: results.asIterable()) {
			long id = entity.getKey().getId();
			String name = (String) entity.getProperty("name");
            String address = (String) entity.getProperty("address");
            String lat = (String) entity.getProperty("lat");
            String lng = (String) entity.getProperty("long");
			long timestamp = (long) entity.getProperty("timestamp");

			Flag flag = new Flag(id, name, address, lat, lng, timestamp);
			flags.add(flag);
		}
		Gson gson = new Gson();
        for (Flag f : flags) {
            System.out.println(f.name + " " + f.lat + " " + f.lng);
        }
		response.setContentType("application/json; charset=UTF-8");
		response.getWriter().println(gson.toJson(flags));
	}

}