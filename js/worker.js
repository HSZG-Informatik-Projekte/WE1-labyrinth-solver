var i = 0;

timedCount = function(){
  i++;
  postMessage(i);
  setTimeout("timedCount()",1000);
}

onmessage = function(e){
	i = e.data;
	timedCount();
}
