/** Global variable to store the email for current user. */
var userId;

/** Logs the user basic info on the console once the users 
  * sign in. */
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  userId = profile.getEmail();
  document.getElementById("signOutButton").addEventListener("click", signOut);
}

/** Function for submit_script to access USERID. */
function getUserId() {
    return userId;
}

/** Google Sign In API default function for signing users 
  * out. Logs that the user signed out on console. */
function signOut() {
    userId = null;
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
    location.reload();
}

/** Returns a boolean of whether the user is signed in on 
  * Google or not. Helper for checkLogin function. */
function isSignedIn() {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
}


/** Hides the "sign-in"/"sign-out" buttons depending on the status
  * of the user. */
function checkLogin() {
    if (!isSignedIn()) {
        document.getElementById("sign_out").style.display = "none";
        document.getElementById("sign_in").style.display = "block";
    } else {
        document.getElementById("sign_out").style.display = "block";
        document.getElementById("sign_in").style.display = "none";
    }
}

/** Reloads the page once the user signs in. */
function reload() {
  setInterval(function() {
    if(gapi.auth2.getAuthInstance().isSignedIn.get()) {
      location.reload();
    }
  }, 1000);
}

