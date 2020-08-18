package com.google.sps;

import org.junit.Assert;
import org.junit.Test;
import java.util.Date;

public class IsTooOldFunctionTest {
    @Test
    public void testIsTooOld1() throws Throwable {
        Date date1 = new Date(2020, 1, 1);
        Date date2 = new Date(2020, 6, 1);
        DeleteFlags underTest = new DeleteFlags();
        boolean result = underTest.isTooOld(date1, date2);
        Assert.assertEquals(true, result);
    }

    @Test
    public void testIsTooOld2() throws Throwable {
        Date date1 = new Date(2020, 1, 1);
        Date date2 = new Date(2020, 1, 5);
        DeleteFlags underTest = new DeleteFlags();
        boolean result = underTest.isTooOld(date1, date2);
        Assert.assertEquals(false, result);
    }
}
