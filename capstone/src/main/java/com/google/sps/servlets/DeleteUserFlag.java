package com.google.sps;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for deleting comments. */
@WebServlet("/deleteUserFlag")
public class DeleteUserFlag extends HttpServlet {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        long id = Long.parseLong(request.getParameter("flagId"));

        Key flagKey = KeyFactory.createKey("Flag", id);
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.delete(flagKey);
        response.sendRedirect("/home.html");
    }
}