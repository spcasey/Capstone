package com.google.sps.servlets;

import static org.junit.Assert.assertEquals;
import org.junit.*;
import java.util.Date;

public class DeleteFlagsTest {
    @Test
    public void testIsTooOld1() throws Throwable {
        Date date1 = new Date(2020, 1, 1);
        Date date2 = new Date(2020, 6, 1);
        DeleteFlags underTest= new DeleteFlags();
        boolean result = underTest.isTooOld(date1, date2);
        assertEquals(true, result);
    }

    @Test
    public void testIsTooOld2() throws Throwable {
        Date date1 = new Date(2020, 1, 1);
        Date date2 = new Date(2020, 1, 5);
        DeleteFlags underTest= new DeleteFlags();
        boolean result = underTest.isTooOld(date1, date2);
        assertEquals(false, result);
    }
}