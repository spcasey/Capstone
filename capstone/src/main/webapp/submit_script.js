window.onload = function(){
  if(localStorage.getItem("prev_page") !== "home"){
    window.location.href = 'home.html';
  }
  let time = new Date();
  if(time.getHours() >= 18){ //18: after 6:00 pm
    document.body.style.backgroundColor = '#614051';
    document.body.style.color = '#fff';
  }
  document.getElementById('verify').innerHTML = 'Verify data for ' + localStorage.getItem("form-place-name") 
    + ', located at ' + localStorage.getItem("form-place-address") + ' (<a href="home.html">Wrong place?</a>).';
}

//backend verification of reCaptcha data 
function verifyInput(){
  var response = grecaptcha.getResponse();
  if (response.length == 0) { 
    alert("Please verify you are human!"); 
  } else if (document.getElementById("agree").checked !== true) {
    localStorage.setItem("prev_page", "");
    window.location.href = 'home.html';
  } else {
    let verify_link = '/verify?response=' + response + "&secret_key=6Ldzs7gZAAAAACty5JwfyZMheDu_EHnxFKJQ16qL"; 
    fetch(verify_link).then(response => response.text()).then((output) => {
      let output_dict = JSON.parse(output);
      console.log(output_dict);
      if (output_dict['error'] === undefined) { 
        if (output_dict["success"] === true) {
          localStorage.setItem("prev_page", "");
          let data_link = '/data?place-name=' + localStorage.getItem('form-place-name') + 
            '&place-address=' + localStorage.getItem('form-place-address') + '&lat=' + 
          localStorage.getItem('form-lat') + '&long=' + localStorage.getItem('form-long') 
          + '&userId=' + localStorage.getItem('form-userId');
          $.ajax({
            type : 'POST',
            data: '', 
            url: data_link, 
            success: function(result) {
              window.location.href = 'home.html';
            },
            error: function(error) {
              window.location.href = 'home.html';
            }}
          );
        }
      }
    });
  }
}