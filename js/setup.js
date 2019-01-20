var radioValue
$(document).ready(function(){
    // Setzen der Variable auf den Wert des Ausgewählte Radiobuttons
    $("input[name='methode']").click(function(){
        radioValue = $("input[name='methode']:checked").val();
    });
    $(".aVC").on("input",function(){
    	activeValueChange();
    });
    $("#difficultybox").change(function(){
    	difficultycase($('#difficultybox').val());
    });
    $(".setInput").on("input", function(){
    	difficultyChange();
    	outputnumber();
    });
    $(".opn").on("input",function(){
    	outputnumber();
    });
    $(".oC").click(function(){
    	if (($("#heightInput").val() <= 20) && ($("#widthInput").val() <= 20)) {
	    	if (changedValues) {
		        createChooseMaze("rand");
		        changedValues = false;
	    	}
	    	openChoose();

	    	var tableWidth = $("#widthInput").val() * ($("#boderSpacingId").width() + 8);
	    	$("#choosemaze").width(tableWidth);
    		$("#chooseCloseId").width(tableWidth);
	    } else {
	    	alert("Die gewählten Labyrinth Dimensionen sind zu groß für das Selbstbauen. \n Die maximale Größe beträgt 20x20 Felder.");
	    	$("input[value='gen']").prop({"checked":true});
	    }
    });
    $("#optform").on("submit",function(){
    	setMazeSettings();
    	changeButtonText('res');
    });
    $("#setupbutton").click(function(){
    	radioValue = $("input[name='methode']:checked").val();
    	genSetup();
    });
    $("#restartbutton").click(function(){
    	$("body").off("click", "#startbutton", setStartButton);
    	setReStartButton();
    });
    $("#optClose").click(function(){
    	$("#setup-modal").css("display","none");
    });
    $("#chooseClose").click(function(){
    	$("#mazechoose-modal").css("display","none");
    });
    $("#loginClose").click(function(){
    	$("#login-modal").css("display","none");
    });
    $(".dropBoxes").change(function(){
    	$("body").off("click", "#startbutton", setStartButton);
    	setReStartButton();
    });
    $("#fillAllWalls").click(function(){
    	createChooseMaze('fill');
    });
    $("#clearAllWalls").click(function(){
    	createChooseMaze('clear');
    });
    $("#fillRandomWalls").click(function(){
    	createChooseMaze('rand');
    });
    $(".runner").on("input",function(){
    	setRunnerSettings();
    });
    $("#loadStats").click(function(){
    	setStatisticTable();
    	$("#loadStats").html("Statistik aktualisieren");
    });
    $("#changepw").click(function(){
    	$("#changeDiv").removeClass("hidden");
    	$("#deleteDiv").addClass("hidden");
    });
    $("#confirmChange").click(function(){
    	user_request("changepw");
    	$("#changeDiv").addClass("hidden");
    });
    $("#confirmDelete").click(function(){
    	user_request("delete");
    	user_request("logout")
    	$("#deleteDiv").addClass("hidden");
    });
    $("#delete").click(function(){
    	$("#deleteDiv").removeClass("hidden");
    	$("#changeDiv").addClass("hidden");
    });
    getLocalStorage();  //hole localStorage, wenn vorhanden @ backend.js
    checkLifeTimeLocalStorage();//Prüft Gülitgkeit des LocalStorage @ backend.js
    user_request('selflogin');//Prüft ob Benutzer vorhandene Anmeldung hat und loggt ein @ backend.js
});

function setStatisticTable(){
	user_request("getstats",generateSeed()); 
	var table, x, c;
	table="<table border='1' class='statTable'>";
	table+="<tr><td>Name des Spielers</td>";
	table+="<td>Schritte</td>";
	table+="<td>Zeit</td></tr>";
	x=1;
	c=1;
	for(i in returnGetStats){
	    if(returnGetStats[i].user!="cpu"&&x==1){
	      	table+="<tr class='highscoreGold'><td>"+returnGetStats[i].user+"</td>"
	      	table+="<td>"+returnGetStats[i].steps+"</td>"
	      	table+="<td>"+returnGetStats[i].time+" s"+"</td></tr>"
	      	x++;
	    }
	    else{
	    	if(returnGetStats[i].user!="cpu"&&x==2){
	        	table+="<tr class='highscoreSilver'><td>"+returnGetStats[i].user+"</td>"
	        	table+="<td>"+returnGetStats[i].steps+"</td>"
	        	table+="<td>"+returnGetStats[i].time+" s"+"</td></tr>"
	        	x++;
	      	}
	      	else{
		        if(returnGetStats[i].user!="cpu"&&x==3){
		        	table+="<tr class='highscoreBronce'><td>"+returnGetStats[i].user+"</td>"
		        	table+="<td>"+returnGetStats[i].steps+"</td>"
		        	table+="<td>"+returnGetStats[i].time+" s"+"</td></tr>"
		        	x++;
		        }
		        else{
		        	if(c==1&&returnGetStats[i].user=="cpu"){
			        	c++;
			        	table+="<tr><td>"+returnGetStats[i].user+"</td>"
			        	table+="<td>"+returnGetStats[i].steps+"</td>"
			        	table+="<td>"+returnGetStats[i].time+" s"+"</td></tr>"
			        }
			        else{
			        	if(returnGetStats[i].user!="cpu"){
			        		table+="<tr><td>"+returnGetStats[i].user+"</td>"
			        		table+="<td>"+returnGetStats[i].steps+"</td>"
			        		table+="<td>"+returnGetStats[i].time+" s"+"</td></tr>"
			        	}
			        }
		        }
	      	}
	    }
  	}
  table+="</table>";
  $("#innerProfileDiv").html(table);
}
function genSetup() {
	$("#setup-modal").css("display","block");
}

function openChoose() {
	$("#mazechoose-modal").css("display","block");
}

function outputnumber() {
	$('#wskvalue').html("Warscheinlichkeit für Mauern: " + $('#wskrange').val() / 100);
	$('#stepsPerSecondValue').html("Schritte pro Sekunde &asymp; " + $('#stepsPerSecond').val());
}

function resetGenButton() {
  $('#genbutton').val("Generieren");
  $("#dcircle").css("display","none");
}
function changeButtonText(is){
	var res="";
	switch(is){
		case "Start!":
			res = "Anhalten!";
			$("#startbutton").css("background-color","#EB5456");//rot
			break;
		case "Anhalten!":
			res="Fortsetzen!";
			$("#startbutton").css("background-color","#FBD53F");//orange
			break;
		case "Fortsetzen!":
			res="Anhalten!";
			$("#startbutton").css("background-color","#EB5456");//rot
			break;
		case "res":
	      	res="Start!";
	    	$("#startbutton").css("background-color","#A4F760");//grün
			break;
		case "neu":
			res= "Neu Starten!"
			$("#startbutton").css("background-color","#FBD53F");//orange
			break;
		case "Neu Starten!":
			res="Start!";
	    	$("#startbutton").css("background-color","#A4F760");//grün
			break;
	}
	$("#startbutton").html(res);	
}

function setDropBoxesDisabled(loacalBool){
  $("#dropbox1").attr("disabled",loacalBool);
  $("#dropbox2").attr("disabled",loacalBool);
}

function difficultycase(x) {
	switch(x) {
		case "Einfach":
			$('#heightInput').val("10");
			$('#widthInput').val("10");
			$('#yInputStart').val("1");
			$('#xInputStart').val("1");
			$('#yInputGoal').val("10");
			$('#xInputGoal').val("10");
			$('#wskrange').val("40");
			$('#wskvalue').html("Warscheinlichkeit für Mauern: 0.4");
			$("input[value='gen']").prop({"checked":true});
			$('#line').prop({"checked":true});
			break;
		case "Mittel":
			$('#heightInput').val("15");
			$('#widthInput').val("15");
			$('#yInputStart').val("1");
			$('#xInputStart').val("1");
			$('#yInputGoal').val("15");
			$('#xInputGoal').val("15");
			$('#wskrange').val("45");
			$('#wskvalue').html("Warscheinlichkeit für Mauern: 0.45");
			$("input[value='gen']").prop({"checked":true});
			$('#line').prop({"checked":true});
			break;
		case "Schwer":
			$('#heightInput').val("20");
			$('#widthInput').val("20");
			$('#yInputStart').val("1");
			$('#xInputStart').val("1");
			$('#yInputGoal').val("20");
			$('#xInputGoal').val("20");
			$('#wskrange').val("50");
			$('#wskvalue').html("Warscheinlichkeit für Mauern: 0.5");
			$("input[value='gen']").prop({"checked":true});
			$('#line').prop({"checked":false});
			break;
		case "Benutzerdefiniert":
			break;
	}
	setMax();
	activeValueChange();
}

function activeValueChange(){
	changedValues = true;
	difficultyChange();
}

function difficultyChange(){
	if(($("#heightInput").val()==10) &&
		($("#widthInput").val()==10) &&
		($("#yInputStart").val()==1) &&
		($("#xInputStart").val()==1) &&
		($("#yInputGoal").val()==10) &&
		($("#xInputGoal").val()==10) &&
		($("#wskrange").val()==40) &&
		(radioValue == "gen") &&
		($("#line").prop("checked")==true))
	{
		$("#difficultybox").val("Einfach");
	}
	else{
		if(($("#heightInput").val()==15) &&
		($("#widthInput").val()==15) &&
		($("#yInputStart").val()==1) &&
		($("#xInputStart").val()==1) &&
		($("#yInputGoal").val()==15) &&
		($("#xInputGoal").val()==15) &&
		($("#wskrange").val()==45) &&
		(radioValue == "gen") &&
		($("#line").prop("checked")==true))
		{
			$("#difficultybox").val("Mittel");
		}
		else{
			if(($("#heightInput").val()==20) &&
			($("#widthInput").val()==20) &&
			($("#yInputStart").val()==1) &&
			($("#xInputStart").val()==1) &&
			($("#yInputGoal").val()==20) &&
			($("#xInputGoal").val()==20) &&
			($("#wskrange").val()==50) &&
			(radioValue == "gen") &&
			($("#line").prop("checked")==false))
			{
				$("#difficultybox").val("Schwer");
			}
			else{
				$("#difficultybox").val("Benutzerdefiniert");
			}
		}
	}
	setMax();
}

function setMax(){
	$("#yInputGoal").attr("max",parseInt($("#heightInput").val()));
	$("#xInputGoal").attr("max",parseInt($("#widthInput").val()));
	$("#yInputStart").attr("max",parseInt($("#heightInput").val()));
	$("#xInputStart").attr("max",parseInt($("#widthInput").val()));
}
	