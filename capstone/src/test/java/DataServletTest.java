package com.google.sps;

import java.util.List;
import java.util.ArrayList;
import java.io.IOException;
import com.google.sps.Flag;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import java.util.Date;

import org.junit.Assert;

public class DataServletTest {

  private static final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

  @BeforeClass
  public static void setup() {
    helper.setUp();
  }

  @AfterClass
  public static void done() {
    helper.tearDown();
  }

  @Test
  public void saveFlags() {
    DataServlet underTest = new DataServlet();
    Date currentDate = new Date();
    Entity entry =
        underTest.addFlagToDatastore(
            "testName", "testAddress", "testLat", "testLng", "testUserId", currentDate);
    Assert.assertEquals("Flag", entry.getKind());
    Assert.assertEquals("testName", entry.getProperty("name"));
    Assert.assertEquals("testAddress", entry.getProperty("address"));
    Assert.assertEquals("testLat", entry.getProperty("lat"));
    Assert.assertEquals("testLng", entry.getProperty("long"));
    Assert.assertEquals("testUserId", entry.getProperty("userId"));
    Assert.assertTrue(entry.getProperty("date").equals(currentDate));
  }

  @Test
  public void getFlags() {
    DataServlet underTest = new DataServlet();
    ArrayList<Flag> flagList = underTest.fetchFlags();
    Flag testFlag = flagList.get(0);
    Assert.assertEquals("testName", testFlag.getName());
    Assert.assertEquals("testAddress", testFlag.getAddress());
    Assert.assertEquals("testLat", testFlag.getLat());
    Assert.assertEquals("testLng", testFlag.getLng());
    Assert.assertEquals("testUserId", testFlag.getUserId());
  }
}
