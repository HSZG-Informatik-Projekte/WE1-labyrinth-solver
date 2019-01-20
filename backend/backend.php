<?php
	/*
	 * backend.php
	 * Serverseitige Verwaltung von Anfragen
	 * @author: Sebastian
	 *
	 * @params: action STRING Was soll ausgeführt werden
	 * @params: user STRING Benutzername
	 * @params: pass STRING Passwort des Benutzers
	 * @params: oldpass STRING Altes Passwort, nur bei Änderung
	 *
	 * @return: JSON(status, msg [, username]) STRING
	*/
	session_start();

  /*
  //DEBUGinfo
	echo nl2br(print_r($_POST,true));
	echo nl2br(print_r($_SESSION,true));
	echo nl2br(print_r($_COOKIE,true));
	*/

	//POST parameter:
	$action = strtolower(isset($_POST["action"]) ? $_POST["action"] : "");

	//Variablen
	$returnStatus = "";
	$returnMsg = "";

	//Datenbank
	$myPDO = new PDO('sqlite:backend.db');

	/*
	 * login
	*/
	if($action == "login"){
		$username = isset($_POST["user"]) ? $_POST["user"] : "";
		$password = isset($_POST["pass"]) ? $_POST["pass"] : "";
		$remember = isset($_POST["remember"]) ? $_POST["remember"] : "";

		$stmt = $myPDO->prepare("SELECT * FROM users WHERE username = ?");
		$result = $stmt->execute(array($username));
		$user = $stmt->fetch();

		if ($user && password_verify($password, $user['password'])) { //true = user existiert
			$returnStatus = "OK";
			$returnMsg = "Login erfolgreich.";

			$_SESSION['userid'] = $user['UID'];

			if($remember == "true") {
			   $stmt = $myPDO->prepare("DELETE FROM securitytokens WHERE UID = ?");
				 $result = $stmt->execute(array($user['UID']));

				 $identifier = password_hash(random_string(), PASSWORD_DEFAULT);
				 $securitytoken = password_hash(random_string(), PASSWORD_DEFAULT);

				 $insert = $myPDO->prepare("INSERT INTO securitytokens (UID, identifier, securitytoken) VALUES (?, ?, ?)");
				 $insert->execute(array($user['UID'], $identifier, $securitytoken));
				 setcookie("identifier", $identifier, time()+(3600*24*30)); //30 Tage Gültigkeit
				 setcookie("securitytoken", $securitytoken, time()+(3600*24*30)); //30 Tage Gültigkeit
		  }
		} else {
			$returnStatus = "ERROR";
			$returnMsg = "Benutzer und Passwort stimmen nicht überein.<br>Bitte versuche es erneut.";
		}

		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg, "username"=>$username));
	}

	/*
	 * Self - login
	*/
	if($action == "selflogin") {
		$user="";
		//Wenn keine SESSION userid vorhanden, aber identifier und securitytoken im COOKIE, dann gehe in IF und prüfe den TOKEN
		if(!isset($_SESSION['userid']) && isset($_COOKIE['identifier']) && isset($_COOKIE['securitytoken'])) {
		   $identifier = $_COOKIE['identifier'];
		   $securitytoken = $_COOKIE['securitytoken'];

		   $statement = $myPDO->prepare("SELECT * FROM securitytokens WHERE identifier = ?");
		   $result = $statement->execute(array($identifier));
		   $securitytoken_row = $statement->fetch();

			 //Token wird geprüft
		   if($securitytoken !== $securitytoken_row['securitytoken']) {
				 	$returnStatus = "ERROR";
	 				$returnMsg = "Fehler bei Token Authentifizierung.";
		   } else { //Token war korrekt
		      //Setze neuen Token
		      $neuer_securitytoken = password_hash(random_string(), PASSWORD_DEFAULT);
		      $insert = $myPDO->prepare("UPDATE securitytokens SET securitytoken = ? WHERE identifier = ?");
		      $insert->execute(array($neuer_securitytoken, $identifier));
					//setze Cookies
 				  setcookie("identifier",$identifier,time()+(3600*24*30)); //30Tage Gültigkeit
		      setcookie("securitytoken",$neuer_securitytoken,time()+(3600*24*30)); //30Tage Gültigkeit

		      //Logge den Benutzer ein
		      $_SESSION['userid'] = $securitytoken_row['UID'];

					//Nutzename holen
					$stmt = $myPDO->prepare("SELECT username FROM users WHERE UID = ?");
					$result = $stmt->execute(array($securitytoken_row['UID']));
					$user = $stmt->fetch()['username'];

				  $returnStatus = "OK";
				  $returnMsg = "Erfolgreich token Authentifiziert.";
		   }
		}
		//wenn SESSION userid vorhanden dann Nutzer anmelden
		if(isset($_SESSION['userid'])) {
			//Nutzename holen
			$stmt = $myPDO->prepare("SELECT username FROM users WHERE UID = ?");
			$result = $stmt->execute(array($_SESSION['userid']));
			$user = $stmt->fetch()['username'];

			if($user) {
				$returnStatus = "OK";
				$returnMsg = "Erfolgreich selbst Authentifiziert.";
			} else {
			  $returnStatus = "ERROR";
				$returnMsg = "Fehler bei selbst Authentifizierung.";
			}
	  } else {
		  $returnStatus = "ERROR";
			$returnMsg = "Fehler bei selbst Authentifizierung.";
		}
		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg, "username"=>$user));
	}

	/*
	 * logout
	*/
	if($action == "logout") {
		unset($_SESSION["userid"]);
		session_destroy();

		//Cookies entfernen
		setcookie("identifier","",time()-(3600*24*30));
		setcookie("securitytoken","",time()-(3600*24*30));

		$returnStatus = "OK";
		$returnMsg = "Erfolgreich Ausgeloggt.";

		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
	}

	/*
	 * register
	*/
	if($action == "register"){
		$username = isset($_POST["user"]) ? $_POST["user"] : "";
		$password = isset($_POST["pass"]) ? password_hash($_POST["pass"], PASSWORD_DEFAULT) : "";

		if($username == "" | $password == "") {
			$returnStatus = "ERROR";
			$returnMsg = "Registrierung fehlgeschlagen.<br>Bitte versuche es erneut.";
		} else {
			$stmt = $myPDO->prepare("SELECT * FROM users WHERE username = ?");
			$result = $stmt->execute(array($username));
			$user = $stmt->fetch();

			if ($user) { //true = user existiert
				$returnStatus = "ERROR";
				$returnMsg = "Registrierung fehlgeschlagen.<br>Bitte versuche es erneut.";
			} else {
				$stmt = $myPDO->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
				$result = $stmt->execute(array($username, $password));

				$returnStatus = "OK";
				$returnMsg = "Registrierung erfolgreich.";
			}
		}

		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
	}

	/*
   * changePW
	*/
	if($action == "changepw"){
		$UID = isset($_SESSION["userid"]) ? $_SESSION["userid"] : "";
		$newPassword = isset($_POST["changepass"]) ? password_hash($_POST["changepass"], PASSWORD_DEFAULT) : "";
		$oldPassword = isset($_POST["oldpass"]) ? $_POST["oldpass"] : "";

		$stmt = $myPDO->prepare("SELECT * FROM users WHERE UID = ?");
		$result = $stmt->execute(array($UID));
		$pw = $stmt->fetch()['password'];

		if(password_verify($oldPassword, $pw)) {
				$stmt = $myPDO->prepare("UPDATE users SET password = ? WHERE UID = ?");
				$result = $stmt->execute(array($newPassword, $UID));

				$returnStatus = "OK";
				$returnMsg = "Passwortänderung erfolgreich.";
		} else {
				$returnStatus = "ERROR";
				$returnMsg = "Passwortänderung fehlgeschlagen.<br>Bitte versuche es erneut.";
		}
		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
	}

	/*
   * delete
	*/
	if($action == "delete"){
		$UID = isset($_SESSION["userid"]) ? $_SESSION["userid"] : "";
		$password = isset($_POST["deletepass"]) ? $_POST["deletepass"] : "";

		$stmt = $myPDO->prepare("SELECT * FROM users WHERE UID = ?");
		$result = $stmt->execute(array($UID));
		$pw = $stmt->fetch()['password'];

		if (password_verify($password, $pw)) { //true = pw richtig
			$stmt = $myPDO->prepare("DELETE FROM users WHERE UID = ?");
			$result = $stmt->execute(array($UID));

			unset($_SESSION["userid"]);
			session_destroy();

			//Cookies entfernen
			setcookie("identifier","",time()-(3600*24*30));
			setcookie("securitytoken","",time()-(3600*24*30));

			$returnStatus = "OK";
			$returnMsg = "Account erfolgreich gelöscht.";
		} else {
			$returnStatus = "ERROR";
			$returnMsg = "Accountlöschung fehlgeschlagen.<br>Bitte versuche es erneut.";
		}

		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
	}

	/*
   * loggedin
	*/
	if($action == "loggedin"){
		if(isset($_SESSION["userid"])) {
			$returnStatus = "OK";
			$returnMsg = "Benutzer angemeldet.";
		} else {
			$returnStatus = "ERROR";
			$returnMsg = "Benutzer nicht angemeldet.";
		}
		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
	}

	/*
   * random_string
	 *
	 * @return
	 * Schlüssel als String
	*/
	function random_string() {
	   if(function_exists('random_bytes')) {
	      $bytes = random_bytes(16);
	      $str = bin2hex($bytes);
	   } else if(function_exists('openssl_random_pseudo_bytes')) {
	      $bytes = openssl_random_pseudo_bytes(16);
	      $str = bin2hex($bytes);
	   } else if(function_exists('mcrypt_create_iv')) {
	      $bytes = mcrypt_create_iv(16, MCRYPT_DEV_URANDOM);
	      $str = bin2hex($bytes);
	   } else {
	      $str = md5(uniqid('WebEngineering' . date('Y-m-d H:i:s'), true));
	   }
	   return $str;
	}


	/*
	 * Übertragung der Statistik
	*/
	if($action == "setstats") {
		$steps = isset($_POST["steps"]) ? $_POST["steps"] : "";
		$time = isset($_POST["time"]) ? $_POST["time"] : "";
		$seed = isset($_POST["seed"]) ? $_POST["seed"] : "";
		$cpu = isset($_POST["cpu"]) ? $_POST["cpu"] : "false";

		if($steps == "" || $time == "" || $seed == "") {
			$returnStatus = "ERROR";
			$returnMsg = "Fehler bei Übertragung der Statistik";
		} else {
			if(isset($_SESSION["userid"]) && $cpu == "false") {
				//Wenn Benutzer angemeldet
				$stmt = $myPDO->prepare("INSERT INTO stats (UID, steps, time, seed) VALUES (?, ?, ?, ?)");
				$result = $stmt->execute(array($_SESSION["userid"], $steps, $time, $seed));

				$returnStatus = "OK";
				$returnMsg = "Übertragung der Statistik erfolgreich.";
			} else {
				//Kein Benutzer angemeldet, eintragen für Computer -> UID = 1
				$stmt = $myPDO->prepare("INSERT INTO stats (UID, steps, time, seed) VALUES (?, ?, ?, ?)");
				$result = $stmt->execute(array(1, $steps, $time, $seed));

				$returnStatus = "OK";
				$returnMsg = "Übertragung der Statistik erfolgreich.";
			}
		}
		echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
	}
	/*
	 * Holen der Statistik
	*/
	if($action == "getstats") {
		$seed = isset($_POST["seed"]) ? $_POST["seed"] : "";

		if($seed == "") {
			$returnStatus = "ERROR";
			$returnMsg = "Fehler bei Übertragung der Statistik";
			echo json_encode(array("status"=>$returnStatus, "msg"=>$returnMsg));
		} else {
			$stmt = $myPDO->prepare("SELECT STID, users.username AS user, steps, time, seed FROM stats
																JOIN users ON stats.UID = users.UID
																WHERE seed = ?
																ORDER BY steps, time");
			$stmt->execute(array($seed));
			$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
			echo json_encode($data);
		}
	}

	$myPDO = null;
?>
