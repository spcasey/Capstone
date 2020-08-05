/** Logs the user basic info on the console once the users 
  * sign in. */
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId());
  console.log('Name: ' + profile.getName());
  console.log('Email: ' + profile.getEmail());
}

/** Google Sign In API default function for signing users 
  * out. Logs that the user signed out on console. */
function signOut() {
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

/** Hide the report button if the user does not sign in. Also
  * hides the "sign-in"/"sign-out" buttons depending on the status
  * of the user. */
function checkLogin() {
    if (!isSignedIn()) {
        document.getElementById("report").style.display = "none";
        document.getElementById("sign_out").style.display = "none";
    } else {
        document.getElementById("report").style.display = "block";
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

