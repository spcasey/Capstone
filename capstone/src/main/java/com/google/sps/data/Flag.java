package com.google.sps.data;

/** An item of a Flag. */
public final class Flag {

  private final long id;
  public final String name;
  private final String address;
  public final String lat;
  public final String lng;
  private final long timestamp;

  public Flag(long id, String name, String address, String lat, String lng, long timestamp) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.timestamp = timestamp;
  }
}