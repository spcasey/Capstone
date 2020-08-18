package com.google.sps;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import java.util.Date;

import org.junit.Assert;

public class DataServletTest {

    private static final LocalServiceTestHelper helper =
        new LocalServiceTestHelper(
            new LocalDatastoreServiceTestConfig());


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
        Entity entry = underTest.addFlagToDatastore("testName", "testAddress", "testLat",
            "testLng", "testUserId", currentDate);
        Assert.assertEquals("Flag", entry.getKind());
        Assert.assertEquals("testName", entry.getProperty("name"));
        Assert.assertEquals("testAddress", entry.getProperty("address"));
        Assert.assertEquals("testLat", entry.getProperty("lat"));
        Assert.assertEquals("testLng", entry.getProperty("long"));
        Assert.assertEquals("testUserId", entry.getProperty("userId"));
        Assert.assertTrue(entry.getProperty("date").equals(currentDate));
    }

}