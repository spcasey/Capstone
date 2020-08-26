package com.google.sps.servlets;

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

/*backend verification for reCaptcha, prevent bot spamming*/
@WebServlet("/verify")
public class reCaptchaVerify extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String link = "https://www.google.com/recaptcha/api/siteverify";
    String gresponse = request.getParameter("response");
    String key = request.getParameter("secret_key");
    String verified = "";
    if (gresponse != null && gresponse.length() > 0) {
      URL url = new URL(link);
      HttpURLConnection url_connect = (HttpURLConnection) url.openConnection();
      url_connect.setRequestMethod("POST");
      url_connect.setDoOutput(true);
      String params = "secret=" + key + "&response=" + gresponse;
      OutputStream output = url_connect.getOutputStream();
      output.write(params.getBytes());
      output.flush();
      output.close();
      int code = url_connect.getResponseCode();
      BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
      StringBuffer data = new StringBuffer();
      try {
        reader = new BufferedReader(new InputStreamReader(url_connect.getInputStream()));
        String input = reader.readLine();
        while (input != null) {
          data.append(input);
          input = reader.readLine();
        }
        verified = data.toString();
      } catch (Exception e) {
        verified = "{\"error\": \"yes\"}";
      } finally {
        reader.close();
      }
      JSONObject json = new JSONObject(verified);
      response.setContentType("application/json");
      response.getWriter().println(json.toString());
    }
  }
}
