package com.google.sps;

import org.junit.Assert;
import org.junit.Test;
import java.util.Date;

public class FlagTest {
    @Test
    public void flagInitTest() throws Throwable {
        long testID = 00000;
        Date testDate = new Date(2020, 1, 1);
        Flag underTest = new Flag(testID, "testUserId", "testName", 
        "testAddress", "testLat", "testLng", testDate);
        Assert.assertEquals(testID, underTest.getId());
        Assert.assertEquals("testUserId", underTest.getUserId());
        Assert.assertEquals("testName", underTest.getName());
        Assert.assertEquals("testLat", underTest.getLat());
        Assert.assertEquals("testLng", underTest.getLng());
    }

}