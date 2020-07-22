package com.google.sps.data;
/* Comment attributes */
public final class Comment {
  private final long id;
  private final long time;
  private final String text;
  public Comment(long id, String text, long time) {
    this.id = id;
    this.text = text;
    this.time = time;
  }
}