$(document).ready(function() {
  $("body").on("click", "#startbutton", setStartButton);

  $("#bmaze").click(function(){
    changePage("bmaze");
  });

  $("#bhelp").click(function(){
    changePage("bhelp");
  });

  $("#bprofile").click(function(){
    changePage("bprofile");
  });

  $("#blogin").click(function(){
    if ($("#blogin").html() == "Login") {
      openlogin();
    } else {
      user_request('logout')
    }
  });

  $("#register").click(function(){
    changeLoginForm("register");
  });


  function changePage(x) {
    $("#bmaze").removeClass("active");
    $("#bhelp").removeClass("active");
    $("#bprofile").removeClass("active");
    switch (x) {
      case "bmaze":
        $("#bmaze").addClass("active");
        $("#dmaze").removeClass("hidden");
        $("#dhelp").addClass("hidden");
        $("#dprofile").addClass("hidden");
        break;
      case "bhelp":
        $("#bhelp").addClass("active");
        $("#dmaze").addClass("hidden");
        $("#dhelp").removeClass("hidden");
        $("#dprofile").addClass("hidden");
        break;
      case "bprofile":
        UserLoggedIn();
        $("#bprofile").addClass("active");
        $("#dmaze").addClass("hidden");
        $("#dhelp").addClass("hidden");
        $("#dprofile").removeClass("hidden");
        break;
    }
  }
});
function openlogin() {
  changeLoginForm("login");
  $("#login-modal").css("display","block");
  $("#user").focus();
}

$(window).click(function(event) {
  var modal1 = document.getElementById("login-modal");
  var modal2 = document.getElementById("setup-modal");
  var modal3 = document.getElementById("mazechoose-modal");
  if (event.target == modal1) {
    modal1.style.display= "none";
  }
  if (event.target == modal2) {
    modal2.style.display= "none";
  }
  if (event.target == modal3) {
    modal3.style.display= "none";
  }
});



/* Basti
 * Wechseln Login Form Registrieren/Login
 * @autor: Sebastian
 *
 * @params: type STRING Angabe für was das Loginform angepasst werden soll
*/
function changeLoginForm(type) {
  //Inputs leeren
  $("#user").val('');
  $("#pass").val('');

  if(type == "login") {
    $("#login-msg").hide();
    $("#login-header").text("Anmeldung");
    $("#login-submit").val("Anmelden");
    $("#login-submit").removeClass("modal-login-register");
    $("#login-submit").attr("onclick","user_request('login')");
    $("#user").attr("onkeydown","if(event.keyCode==13) user_request('login')");
    $("#pass").attr("onkeydown","if(event.keyCode==13) user_request('login')");
    $(".login-register").show();
    $(".modal-login-remember").show();
  } else {
    $("#login-msg").hide();
    $("#login-header").text("Registrierung");
    $("#login-submit").val("Registrieren");
    $("#login-submit").addClass("modal-login-register");
    $("#login-submit").attr("onclick","user_request('register')");
    $("#user").attr("onkeydown","if(event.keyCode==13) user_request('register')");
    $("#pass").attr("onkeydown","if(event.keyCode==13) user_request('register')");
    $(".login-register").hide();
    $(".modal-login-remember").hide();
  }
}
