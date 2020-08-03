//https://www.google.com/recaptcha/admin/site/431534963
//site key: 6Ldzs7gZAAAAAFoQGftNMWNgBPioqza89720ppmw
//secret key: 6Ldzs7gZAAAAACty5JwfyZMheDu_EHnxFKJQ16qL
window.onload = function(){
  if(localStorage.getItem("prev_page") !== "home"){
    window.location.href = 'home.html';
  }
  let time = new Date();
  if (time.getHours() >= 18) { //18: after 6:00 pm
    document.body.style.backgroundColor = '#614051';
    document.body.style.color = '#fff';
  }
  document.getElementById('verify').innerHTML = 'Verify data for ' + localStorage.getItem("form-place-name") 
    + ', located at ' + localStorage.getItem("form-place-address") + ' (<a href="home.html">Wrong place?</a>).';
}
//unrelated but remember to keep track of report counts per places
function verifyInput(){
  var response = grecaptcha.getResponse();
  if(response.length == 0){ 
    alert("Please verify you are human!"); 
  }else if(document.getElementById("agree").checked !== true){
    localStorage.setItem("prev_page", "");
    window.location.href = 'home.html';
  }else{
    localStorage.setItem("prev_page", "");
    let link = '/data?place-name=' + localStorage.getItem('form-place-name') + 
      '&place-address=' + localStorage.getItem('form-place-address') + '&lat=' + 
      localStorage.getItem('form-lat') + '&long=' + localStorage.getItem('form-long');
    $.ajax({
      type : 'POST',
      data: '', 
      url: link, 
      success: function(result){
        window.location.href = 'home.html';
      },
      error: function(error){
        window.location.href = 'home.html';
      }}
    );
  }
}