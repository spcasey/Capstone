package com.google.sps.data;

import java.util.Date;

/** An item of a Flag. */
public final class Flag {

  public final long id;
  public final String userId;
  public final String name;
  private final String address;
  public final String lat;
  public final String lng;
  private final Date date;

  public Flag(long id, String userId, String name, String address, String lat, String lng, Date date) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.date = date;
  }
}