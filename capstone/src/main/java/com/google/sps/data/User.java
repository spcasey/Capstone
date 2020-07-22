package com.google.sps.data;
/* User attributes */
public final class User {
  private final long id;
  private final String userEmail;
  private final String answer;
  public User(long id, String userEmail, String answer) {
    this.id = id;
    this.userEmail = userEmail;
    this.answer = answer;
  }
}