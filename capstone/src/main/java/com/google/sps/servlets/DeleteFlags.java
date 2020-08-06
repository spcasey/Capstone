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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.text.ParseException;

/** Servlet responsible for deleting expired flags. */
@WebServlet("/delete-flag")
public class DeleteFlags extends HttpServlet {

  private static final DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    Query query = new Query("Flag").addSort("date", SortDirection.ASCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	PreparedQuery results = datastore.prepare(query);
    Date currentDate = new Date();

    /** Use a calendar object to count the date when the flags
      * should expire. 
      */
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.add(Calendar.DATE, -14);
    Date currentDateMinusTwoWeeks = c.getTime();

    /** delete flags if the date property of the flag is before
      * the previously calculated date. 
      */
    for (Entity entity: results.asIterable()) {
        Date flagDate = (Date)entity.getProperty("date");
        if (currentDateMinusTwoWeeks.compareTo(flagDate) > 0) {
            datastore.delete(entity.getKey());
        }
        if (currentDateMinusTwoWeeks.compareTo(flagDate) >= 0) {
            break; //No need for additional checks since ordered by date
        }
    }
  }

}

