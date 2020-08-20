package com.google.sps;

import java.util.ArrayList;
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
import java.util.Calendar;

import org.junit.Assert;

public class DeleteFlagsTest {

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
  public void testIsTooOld1() throws Throwable {
    Date date1 = new Date(2020, 1, 1);
    Date date2 = new Date(2020, 6, 1);
    DeleteFlags underTest = new DeleteFlags();
    Assert.assertTrue(underTest.isTooOld(date1, date2));
  }

  @Test
  public void testIsTooOld2() throws Throwable {
    Date date1 = new Date(2020, 1, 1);
    Date date2 = new Date(2020, 1, 5);
    DeleteFlags underTest = new DeleteFlags();
    Assert.assertFalse(underTest.isTooOld(date1, date2));
  }

  @Test
  public void testIsTooOld3() throws Throwable {
    Calendar c = Calendar.getInstance();
    c.setTime(new Date());
    c.add(Calendar.DATE, -20);
    Date date1 = c.getTime();
    Date date2 = Calendar.getInstance().getTime();
    DeleteFlags underTest = new DeleteFlags();
    Assert.assertTrue(underTest.isTooOld(date1, date2));
  }

  @Test
  public void properlyDeletes() throws Throwable {
    Calendar c = Calendar.getInstance();
    c.setTime(new Date());
    c.add(Calendar.DATE, -40);
    Date expired = c.getTime();
    DataServlet dataServlet = new DataServlet();
    Entity entry =
        dataServlet.addFlagToDatastore(
            "testName", "testAddress", "testLat", "testLng", "testUserId", expired);
    Entity anotherEntry =
        dataServlet.addFlagToDatastore(
            "anotherName",
            "anotherAddress",
            "anotherLat",
            "anotherLng",
            "anotherUserId",
            new Date());
    ArrayList<Flag> flagList = dataServlet.fetchFlags();
    Assert.assertEquals(2, flagList.size());
    DeleteFlags underTest = new DeleteFlags();
    underTest.deleteExpiredFlags();
    flagList = dataServlet.fetchFlags();
    Assert.assertEquals(1, flagList.size());
  }
}
