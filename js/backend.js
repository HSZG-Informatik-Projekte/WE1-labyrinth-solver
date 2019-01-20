/*
 * backend.js
 * author: Sebastian
 * Verwendung:
 * - Login
 * - Registrierung
 * - Passwortänderung
 * - Stats
*/
//Globale Variable für die Generierungsmethoden
var radioValue;
var returnGetStats = "";
var login_username = "";

/*
 * Login Form Validierung
 *
 * @return boolean validate
*/
function formValidation() {
  var user = $("#user").val();
  var pass = $("#pass").val();
  var regex = /^[a-zA-Z0-9_-]{3,16}$/; //No Special Characters
  var r = true;

  if (regex.test(user)) {
    $("#user").removeClass("modal-container-error");
  } else {
    $("#user").addClass("modal-container-error");
    r = false;
  }
  if (regex.test(pass)) {
    $("#pass").removeClass("modal-container-error");
  } else {
    $("#pass").addClass("modal-container-error");
    r = false;
  }

  return r;
}

/*
 * Anfrage an Server für Benutzerverwaltung
 *
 * @params a STRING doAction (login, register, changePW)
 * @params steps_user INTEGER Anzahl der benötigten Schritte
 * @params time_user STRING Benötigte Zeit zum lösen
 * @params seed_user INTEGER Eindeutiger Seed der Einstellung
 * @params computer_user BOOLEAN Computer[true] oder Player[false]?
*/
function user_request(a, steps_user, time_user, computer_user){
  //Evtl schon gezeigte Fehlermeldung löschen
	$("#login-msg").remove();

  if ((a == "login" | "register") && formValidation() == false) {
    generateInfoMessageLoginForm("Fehler! Überprüfen Sie Ihre Eingabe!", "error");
    return;
  }

	var chkBoxRemember = document.getElementById("login-remember"); //Angemeldet bleiben? true | false
  a = a.toLowerCase();

	$.post("backend/backend.php",
	{
		action: 	a,
		user:   	$("#user").val(),
		pass:			$("#pass").val(),
		oldpass: 	$("#oldpass").val(),
		changepass: 	$("#changepass").val(),
		deletepass: 	$("#deletepass").val(),
		remember: chkBoxRemember.checked,
		steps: 	  steps_user,
		time:     time_user,
    seed:     generateSeed(),
		cpu:		  computer_user
	},
	function(data, status){
    if(a == "getstats") {
      //console.log(data);
      returnGetStats = JSON.parse(data);
    }
		var obj = JSON.parse(data);
		if(status == "success") { // OK Server Response
			//Prüfen Login
			if(obj.status == "OK") {
        switch (a) {
          case "selflogin":
          case "login":
            login_username = obj.username;
  					// OK Login Status
  					$("#blogin").html("Hallo " + obj.username + " <small>(Logout)</small>");

            //Login Formular wieder verstecken
  					$("#login-modal").removeAttr("style").hide();
            break;
          case "register":
  					// OK Registrieren Status
  					changeLoginForm("login");
  					generateInfoMessageLoginForm(obj.msg, "ok");
            break;
          case "changepw":
            break;
          case "delete":
            //Seite aktualisieren
            location.reload();
            break;
          case "logout":
            //Seite aktualisieren
            location.reload();
            break;
          case "setstats":
            //Statistik aktualisiert
            //call: user_request("setstats", steps[0], time1, true);
            //console.log(obj.msg);
            break;
          case "getstats":
            //Holen der Statistik
            //call: user_request("getstats", 10369);
            // -> returnGetStats
            break;
        }
			} else {
				//Meldung anzeigen wenn, Login fehlgeschlagen
				generateInfoMessageLoginForm(obj.msg, "error");
			}
		} else {
      generateInfoMessageLoginForm("fehler: " + status, "error");
		}
	});
}


//Vorlage für Benutzerprüfung ob eingeloggt oder nicht
function UserLoggedIn(){
  $.post('backend/backend.php', {action: "loggedin"}, function(data){
      var obj = JSON.parse(data);
      if(obj.status == "OK") {
        $("#profileInfo").html("<h1 class='profileText'>"+login_username+"</h1>");
        $("#inProfileDiv").removeClass("hidden");
        $("#outProfileDiv").addClass("hidden");
      }
      else{
        $("#inProfileDiv").addClass("hidden");
        $("#outProfileDiv").removeClass("hidden");
      }
  });
}

/*
 * Generierung Info Meldung
 *
 * @param text String Text in der Meldung
 * @param type String Färbung -> ok | error
 *
*/
function generateInfoMessageLoginForm(text, type) {
	var loginMsg = $("<div></div>").attr('id', 'login-msg');
	loginMsg.addClass("modal-login-msg-" + type);
	loginMsg.addClass("modal-login-msg");
	loginMsg.html(text);
  setTimeout(function() {
   loginMsg.fadeOut(5000);
  }, 10000 );
	$("#login-submit").after(loginMsg);
}

/*
 * Setzt LocalStorage Labyrinth Settings
*/
function setLocalStorage() {
  if(typeof Storage !== "undefined") {
    var ls = {
        setLsTime:    Date.now(),
    		genMethode:   radioValue,
        heightInput:  $('#heightInput').val(),
        widthInput:   $('#widthInput').val(),
        yInputStart:  $('#yInputStart').val(),
        xInputStart:  $('#xInputStart').val(),
        yInputGoal:   $('#yInputGoal').val(),
        xInputGoal:   $('#xInputGoal').val(),
        wsk:          $('#wskrange').val(),
        line:         $('#line').prop("checked"),
        smartMode:    $('#smartMode').prop("checked"),
        SpS:          $('#stepsPerSecond').val()
    }
    try {
      localStorage.setItem("labyrinth_settings", JSON.stringify(ls));
    } catch (e) {
      return;
    }
  }
}

/*
 * Holt LocalStorage Labyrinth Settings
*/
function getLocalStorage() {
  if(typeof Storage !== "undefined") {
    var ls;
    try {
      ls = localStorage.getItem('labyrinth_settings');
    } catch (e) {
      return;
    }
    if (ls != null) {
      var settings = JSON.parse(ls);
      $("input[value='"+radioValue+"']").prop({"checked":true});
      $('#heightInput').val(parseInt(settings.heightInput));
      $('#widthInput').val(parseInt(settings.widthInput));
      $('#yInputStart').val(parseInt(settings.yInputStart));
      $('#xInputStart').val(parseInt(settings.xInputStart));
      $('#yInputGoal').val(parseInt(settings.yInputGoal));
      $('#xInputGoal').val(parseInt(settings.xInputGoal));
      $('#wskrange').val(parseInt(settings.wsk));
      $('#wskvalue').html("Warscheinlichkeit für Mauern: " + (parseInt(settings.wsk) / 100));
      $('#line').prop({"checked":settings.line});
      $('#smartMode').prop({"checked":settings.smartMode});
      $('#stepsPerSecond').val(parseInt(settings.SpS));
      $('#stepsPerSecondValue').html("Schritte pro Sekunde &asymp; " + parseInt(settings.SpS));
      difficultyChange();
      activeValueChange();
    }
  }
}

/*
 * Prüft die Gülitgkeit der LocalStorage Labyrinth Settings
 * Löscht nach 30 Tagen den LocalStorage
*/
function checkLifeTimeLocalStorage() {
  if(typeof Storage !== "undefined") {
    var ls;
    try {
      ls = localStorage.getItem('labyrinth_settings');
    } catch (e) {
      return;
    }
    if (ls != null) {
      var settings = JSON.parse(ls);
      var date = new Date();
      date.setDate(date.getDate() - 30);
      if (settings.setLsTime < date.getTime()) {
        try {
          localStorage.removeItem('labyrinth_settings')
        } catch (e) {
          return;
        }
      }
    }
  }
}

/*
 * Generiert einen SEED
 *
 * @param algModus String Rechte Hand | Linke | ...
 *
 * @return seed Number
*/
function generateSeed() {
  var ls = {
  		genMethode:   genMode, //$('#genMethode').val(),
      heightInput:  yrow, //$('#heightInput').val(),
      widthInput:   xcolumn, //$('#widthInput').val(),
      yInputStart:  ystart, //$('#yInputStart').val(),
      xInputStart:  xstart, //$('#xInputStart').val(),
      yInputGoal:   ygoal, //$('#yInputGoal').val(),
      xInputGoal:   xgoal, //$('#xInputGoal').val(),
      wsk:          wsk//$('#wskrange').val()
  }
  var jString = JSON.stringify(ls);

  var seed = 0;
  for (var i = 0; i < jString.length; i++) {
    seed += jString.charCodeAt(i);
  }

  return seed;
}
