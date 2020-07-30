/*gets comments from servlet doGet and displays it*/
function checkLogin(){
  fetch('/login').then(response => response.text()).then((output) => {
    let user;
    let login_link = document.getElementById('login_link');
    let status = JSON.parse(output);
    if(status['login-status'] === 'out'){
      login_link.innerHTML = 'Login';
    }
    if(status['login-status'] === 'in'){
      localStorage.setItem('userEmail', status['userEmail']);
      localStorage.setItem('highScore', status['highScore']);
      document.getElementById('greet-user').innerHTML = 'Hello ' + status['userEmail'] + '!';
      document.getElementById('greet-user').style.display = 'block';
      login_link.innerHTML = 'Logout';
      user = status['user'];
    }
    login_link.href = status['url'];
    login_link.onclick = '#';
    login_link.style.display = 'block';
    if(status['first-time?'] === true){
      document.getElementById('question').style.display = 'block';
    }
  });
}