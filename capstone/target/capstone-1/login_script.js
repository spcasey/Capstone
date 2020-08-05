function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId());
  console.log('Name: ' + profile.getName());
  console.log('Email: ' + profile.getEmail());
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
    location.reload();
}

function isSignedIn() {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
}

function checkLogin() {
    if (!isSignedIn()) {
        document.getElementById("report").style.display = "none";
        document.getElementById("sign_out").style.display = "none";
    } else {
        document.getElementById("report").style.display = "block";
        document.getElementById("sign_in").style.display = "none";
    }
}

checkLogin();

function reload() {
    setInterval(function() {
    if(gapi.auth2.getAuthInstance().isSignedIn.get()) {
        location.reload();
    }
}, 1000);
}
