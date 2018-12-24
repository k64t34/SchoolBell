// [ ] Если куки Класс не определена, то найти и подставить первый класс из schtt.xml/classes;
// [ ] Рачитать LEssonCount, пока констнта
// [ ] Remake function findSubject(id) 
// [ ] Сортировк в xml
// [x] Cookie.Ring=true
// [ ] Все стили в css
// [ ] Разная подсветка строк в таблице расписания чет\нетеч
// -> Цвет времени меняется в зависимости от остатка 
// -> Первый таймер точно до 59 секунд, второй через минуту. На ежесекундное моргание : .
//-> линия времени в таблице для нерабчего времени. Если время до  полуночи, то ниже всейтаблицы, если после полунчи, то над всей таблицей
//-> Учитывать день недели
//var debug=true;
if (typeof debug === 'undefined')  var debug=false;
var version="1.05 24122018";
var xhttp_sbj = new XMLHttpRequest();
var lastDateTime= new Date();
var curDateTime= new Date(lastDateTime.getTime());
var bells =[];//Object Definition https://www.w3schools.com/js/js_objects.asp
var subjects =[];
var idLesson=-1;
var idLessonNext=-1;
var LessonCount=10; //Максимальное количество уроков в школе
var idLessonPrevios=-1;
var LessonDuration=0; // Продолжительность занятия, перемены или нерабочего времени
var Calendar_Status=-1; //-1 - undefined, 0-timeoff, 1-Lesson, 2-break
var DateTime_NextStatus = new Date(lastDateTime.getFullYear(), lastDateTime.getMonth(), lastDateTime.getDate(), 23, 59);
var DateTime_PreviosStatus = new Date(lastDateTime.getFullYear(), lastDateTime.getMonth(), lastDateTime.getDate(), 0, 0);
var WindowOrientation=1   ;//0-Landscape, 1-Portrait https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
var ClockColon=true;
const strLesson="Урок";
const strBreak="Перемена";
const strTimeoff="Нерабочее время";
const color_status="#FFAAAA";
const color_NOstatus="#FFFFFF";
var TimeSpend =0;
var TimeRest  =0;
var Cookie = {ring:true, theme:"light",class:"3b"};
//var TimeTableClasses[];

//*****************************
function render() {
//*****************************
curDateTime = new Date();
ClockColon=!ClockColon;
document.getElementById('Calendar_Clock').innerHTML = curDateTime.getHours()+
	(ClockColon?"<font color=\"black\">:</font>":"<font color=\"white\">:</font>")+
	(curDateTime.getMinutes()<10?"0":"")+curDateTime.getMinutes();
if (debug) document.getElementById('Calendar_Clock').innerHTML+=":"+(curDateTime.getSeconds()<10?"0":"")+curDateTime.getSeconds();
if (curDateTime>=DateTime_NextStatus)
	{
	Check_Calendar_Status();
	if (Cookie.ring){var a=document.getElementById("soundbell");a.play();}
	}

TimeSpend=Math.floor((curDateTime-DateTime_PreviosStatus)/60000);
TimeRest=Math.ceil((DateTime_NextStatus-curDateTime)/60000);
if (Calendar_Status==0)
	{	
	document.getElementById('Calendar_TimeSpend').innerHTML=GetHimanTimeHM(TimeSpend);
	document.getElementById('Calendar_TimeRest').innerHTML=GetHimanTimeHM(TimeRest);
	}
else
	{
	document.getElementById('Calendar_TimeSpend').innerHTML=TimeSpend+" ";
	document.getElementById('Calendar_TimeRest').innerHTML=" "+TimeRest;
	}

document.getElementById("Lesson_progess").value=TimeSpend;

if (lastDateTime.getDate()!=curDateTime.getDate())
	{ 
	//-> В массиве bells увеличить дату на сутки
	lastDateTime=Date();
	render_date();
	}	
}
//***************************** 
function render_progress_set_status() { 
//*****************************	
LessonDuration=(DateTime_NextStatus-DateTime_PreviosStatus)/60000;
if (debug) console.log("LessonDuration",LessonDuration);
document.getElementById('Calendar_TimeFrom').innerHTML=GetTimeHM(DateTime_PreviosStatus);
document.getElementById('Calendar_TimeTo').innerHTML=GetTimeHM(DateTime_NextStatus);
document.getElementById("Lesson_progess").max=LessonDuration;
if (Calendar_Status==0)
	document.getElementById("Lesson_progess").style.width = "60%";
else	
	document.getElementById("Lesson_progess").style.width = "80%";
}
//***************************** 
function render_date() { // Called on 1st load and after midnight
//*****************************	
document.getElementById('Calendar_Date').innerHTML =new Intl.DateTimeFormat('default',
	{
	weekday: 'short',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
	}).format(lastDateTime);
}	
//*****************************
window.onload = function() {
//*****************************
checkCookie();
timer = setInterval(render, 1000);
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function(){if (this.readyState == 4 && this.status == 200)ReadXML(this);};
xhttp.open("GET", "schtt.xml", true);
xhttp.send();
render_date();
render();
}  
//*****************************
function ReadXML(xhttp) {
//*****************************	
var xmlDoc = xhttp.responseXML;		
if (debug)console.log(xmlDoc);
if (xmlDoc.firstChild.tagName!="Timetable"){PrintErrorTo_calendar_foot("Неверный формат XML");return;}		
if (xmlDoc.firstChild.getElementsByTagName("bell").length==0){PrintErrorTo_calendar_foot("В БД нет раздела звонков");return;}		
var bell = xmlDoc.firstChild.getElementsByTagName("bell")[0];
if (bell.getElementsByTagName("Lesson").length==0){PrintErrorTo_calendar_foot("В БД нет информации о звонках");return;}		
if (debug)console.log(bell);
if (debug)console.log(bell.getElementsByTagName("Lesson").length);
for (i=0;i!=bell.getElementsByTagName("Lesson").length;i++)
	{		
	var Lesson = bell.getElementsByTagName("Lesson")[i];
	if (!Lesson.hasAttribute('lesson')) {PrintErrorTo_calendar_foot("В БД не указан идентификатор урока. Номер строки в списке уроков "+(i+1));return;}
	if (!Lesson.hasAttribute('STARTTIME')) {PrintErrorTo_calendar_foot("В БД не указано время начала урока "+Lesson.getAttribute("lesson"));return;}
	if (!Lesson.hasAttribute('ENDTIME')) {PrintErrorTo_calendar_foot("В БД не указано время окончания урока "+Lesson.getAttribute("lesson"));return;}
	var STARTTIME =Lesson.getAttribute("STARTTIME").split(":");
	var ENDTIME =Lesson.getAttribute("ENDTIME").split(":");
	bells.push({lesson:parseInt(Lesson.getAttribute("lesson")),
		STARTTIME:new Date(lastDateTime.getFullYear(), lastDateTime.getMonth(), lastDateTime.getDate(), STARTTIME[0], STARTTIME[1]),
		ENDTIME:  new Date(lastDateTime.getFullYear(), lastDateTime.getMonth(), lastDateTime.getDate(), ENDTIME[0],   ENDTIME[1])
		});
	}
if (debug)
	{
	first=true;	
	while (true)
		{
		if (first)
			{
			first=false;	
			STARTTIME=new Date();	
			}			
		else
			{
			STARTTIME=new Date(bells[i-1].ENDTIME.getTime()+60000+Math.floor(Math.random()*280*1000));		
			}		
		ENDTIME=new Date(STARTTIME.getTime()+60000+Math.floor(Math.random()*380*1000));
		if (STARTTIME.getDate()!=lastDateTime.getDate() || ENDTIME.getDate()!=lastDateTime.getDate() /*|| ENDTIME.getHours()>22*/)break;
			STARTTIME.setSeconds(0);
			STARTTIME.setMilliseconds(0);
			ENDTIME.setSeconds(0);
			ENDTIME.setMilliseconds(0);
			bells.push({lesson:(bells[i-1].lesson+1),
			STARTTIME:STARTTIME,			
			ENDTIME:ENDTIME
				});	
			i++;	
		}		
	}
	render_timetable();
	Check_Calendar_Status();	
//Read subjects title	
path = "/Timetable/Subjects/subject";
var txt = "";
if (xmlDoc.evaluate) {
	var nodes = xmlDoc.evaluate(path, xmlDoc, null, XPathResult.ANY_TYPE, null);
	var result = nodes.iterateNext();
	iRow = 0;
	while (result) {
		txt += result.childNodes[0].nodeValue + "<br>";
		subjects.push({id:parseInt(result.attributes["0"].nodeValue),name:result.childNodes[0].nodeValue});				
		iRow++;
		result = nodes.iterateNext();
		} 
	//document.getElementById("demo").innerHTML = findSubject(222);
	}	


xhttp_sbj.onreadystatechange = function(){if (this.readyState == 4 && this.status == 200)ReadXMLSubject(this);};
xhttp_sbj.open("GET", Cookie.class+".xml", true);
xhttp_sbj.send();		
}
//*****************************
function ReadXMLSubject(xml) {
//*****************************	
//cell4.innerHTML=strLesson+ " "+ bells[i].lesson;
var xmlDoc = xml.responseXML;		
if (debug)console.log(xmlDoc);
path = "/Class/Day[@id="+curDateTime.getDay()+"]/Lesson";
if (xmlDoc.evaluate) {
	var nodes = xmlDoc.evaluate(path, xmlDoc, null, XPathResult.ANY_TYPE, null);
	var result = nodes.iterateNext();
	iRow = 0;
	while (result) {
		document.getElementById("r_Timetable_"+(iRow)).cells[3].innerHTML=result.childNodes[0].nodeValue;
		//document.getElementById("r_Timetable_"+(iRow)).cells[3].innerHTML=parseInt(result.childNodes[0].nodeValue);
		//document.getElementById("r_Timetable_"+(iRow)).cells[3].innerHTML=findSubject(parseInt(result.childNodes[0].nodeValue));		
		iRow++;
		result = nodes.iterateNext();
	} 
} else if (window.ActiveXObject || xhttp_sbj.responseType == "msxml-document") {
	xml.setProperty("SelectionLanguage", "XPath");
	nodes = xml.selectNodes(path);
	for (i = 0; i < nodes.length; i++) {
		//txt += nodes[i].childNodes[0].nodeValue + "<br>";
		}
    }
	
	
	for (i=iRow;i!=LessonCount;i++)
		{
		document.getElementById("r_Timetable_"+(i)).cells[3].innerHTML="";	
		}	

		//debug document.getElementById("demo").innerHTML = txt;
}
//*****************************	
function Check_Calendar_Status(){
//*****************************
if (curDateTime < bells[0].STARTTIME || curDateTime>bells[bells.length-1].ENDTIME){SetTimeoff();}
else	
	if ( bells[0].STARTTIME<=curDateTime && curDateTime < bells[0].ENDTIME){SetLesson(0);}
	else	
		for (i=1;i!=bells.length;i++)
			{				
			if (bells[i-1].ENDTIME<=curDateTime && curDateTime < bells[i].STARTTIME){SetBreak(i); break;}
			if (bells[i].STARTTIME<=curDateTime && curDateTime < bells[i].ENDTIME)  {SetLesson(i);break;}
			}
}
//*****************************	
function PrintErrorTo_calendar_foot(text){
//*****************************		
document.getElementById("calendar_foot").innerHTML = text;
document.getElementById("calendar_foot").style.background = 'red';
document.getElementById("calendar_foot").style.color = 'white';
}
//*****************************	
function GetTimeHM(date){
//*****************************		
return date.getHours()+":"+(date.getMinutes()<10?"0":"")+date.getMinutes();	
}	
//*****************************	
function GetHimanTimeHM(minute){
//*****************************		
var result="";
if (minute>60)
	{
	h=parseInt(minute/60);
	minute=minute-h*60;
	minute=(minute<10?"0":"")+minute+"м";
	if (h>24) 
		{
		d=parseInt(result/24);
		h=h-d*24;
		result=d+"д ";
		}
	result=result+h+"ч ";
	}
result=result+minute;
return result;
}
//*****************************	
function SetLesson(id){
//*****************************	
if (debug) console.log("SetLesson",id);
Calendar_Status=1;	
idLesson=id;
/*if (idLesson==0)
	document.getElementById("Calendar_PreviosStatus").innerHTML = strBreak;
else
	document.getElementById("Calendar_PreviosStatus").innerHTML = strLesson+" "+bells[bells.length-1].lesson;	*/
document.getElementById("Calendar_PreviosStatus").innerHTML = "";
document.getElementById("Calendar_Status").innerHTML = strLesson+" "+bells[id].lesson;
document.getElementById("Calendar_NextStatus").innerHTML = "";

DateTime_PreviosStatus=bells[id].STARTTIME;
DateTime_NextStatus=bells[id].ENDTIME;

document.getElementById("r_Timetable_"+id).bgColor=color_status;
var row = document.getElementById("r_Timetable_"+(id-1));
for (i=0;i!=row.cells.length;i++)
	{
	row.cells[i].style.borderBottomStyle="none";	
	row.cells[i].style.borderBottomColor=color_NOstatus;	
	}
var row = document.getElementById("r_Timetable_"+id);
for (i=0;i!=row.cells.length;i++)
	{
	row.cells[i].style.borderTopStyle="none";	
	row.cells[i].style.borderTopColor=color_NOstatus;	
	}
render_progress_set_status();	
}	
//*****************************	
function SetBreak(id){
//*****************************	
if (debug) console.log("SetBreak",id);
Calendar_Status=2;
document.getElementById("Calendar_PreviosStatus").innerHTML = strLesson+" "+bells[id-1].lesson;	
document.getElementById("Calendar_Status").innerHTML = strBreak;	
document.getElementById("Calendar_NextStatus").innerHTML = strLesson+" "+bells[id].lesson;	
DateTime_PreviosStatus=bells[id-1].ENDTIME;
DateTime_NextStatus=bells[id].STARTTIME;
document.getElementById("r_Timetable_"+(id-1)).bgColor=color_NOstatus;
var row = document.getElementById("r_Timetable_"+(id-1));
for (i=0;i!=row.cells.length;i++)
	{
	row.cells[i].style.borderBottomStyle="solid";	
	row.cells[i].style.borderBottomColor=color_status;	
	}
var row = document.getElementById("r_Timetable_"+id);
for (i=0;i!=row.cells.length;i++)
	{
	row.cells[i].style.borderTopStyle="solid";	
	row.cells[i].style.borderTopColor=color_status;	
	}		
render_progress_set_status();	
}
//*****************************	
function SetTimeoff(){
//*****************************
if (debug) console.log("SetTimeoff");
Calendar_Status=0;
document.getElementById("Calendar_PreviosStatus").innerHTML = "";	
document.getElementById("Calendar_Status").innerHTML = strTimeoff;	
document.getElementById("Calendar_NextStatus").innerHTML = "";

if (curDateTime<bells[0].STARTTIME)
	{
	DateTime_NextStatus=new Date(bells[0].STARTTIME.getTime());
	DateTime_PreviosStatus=new Date(bells[bells.length-1].ENDTIME-3600*24*1000);
	}
else if (curDateTime>bells[bells.length-1].ENDTIME)	
	{
	DateTime_NextStatus=new Date(bells[0].STARTTIME.getTime()+3600*24*1000);
	DateTime_PreviosStatus=new Date(bells[bells.length-1].ENDTIME);
	}
render_progress_set_status();	
}
//*****************************	
function render_timetable(){
//*****************************
var tbl = document.getElementById("tbl_timetable");
for (i=0;i!=bells.length;i++)
	{
	var row = tbl.insertRow(-1);
	row.id="r_Timetable_"+i;
	var cell1 = row.insertCell(0);
	cell1.width="10%";
	cell1.innerHTML=bells[i].lesson;	
	var cell2 = row.insertCell(1);
	cell2.innerHTML=GetTimeHM(bells[i].STARTTIME);	
	var cell3 = row.insertCell(2);
	cell3.innerHTML=GetTimeHM(bells[i].ENDTIME);
	var cell4 = row.insertCell(3);
	cell4.innerHTML=strLesson+ " "+ bells[i].lesson;	
	}
}
//*****************************
function setCookie(cname, cvalue, exdays) {
//*****************************	
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
//*****************************
function getCookie(cname) {
//*****************************	
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
//*****************************
function checkCookie() {
//*****************************
//Ring
var ring = getCookie("ring");  
if (debug) console.log("checkCookie() ring="+ring); 
if (ring == "") 
	setCookie("ring", Cookie.ring, 365);
else
	Cookie.ring=(/true/i).test(ring) ;
if (debug) console.log("checkCookie() Cookie.ring="+Cookie.ring);
btn_sound_set_image();
//Class
var TimeTableClass = getCookie("class");  
if (TimeTableClass == "") 
	setCookie("class", Cookie.class, 365);
else
	Cookie.class=TimeTableClass;
btn_class_set(Cookie.class);
}
//*****************************
function btn_class_set(idClass){
//*****************************
document.getElementById('btn_class').innerHTML=idClass;}	
//*****************************
function btn_sound_onclick(){
if (debug) console.log("btn_sound.onclick"); 
Cookie.ring=!Cookie.ring;
setCookie("ring", Cookie.ring, 365);
btn_sound_set_image();
}	
function btn_sound_set_image(){
if (debug) console.log("btn_sound_set_image() Cookie.ring="+Cookie.ring);	
var new_style="bell_"
if (Cookie.ring)new_style+="on";else new_style+="off";
if (debug) console.log("btn_sound_set_image() "+new_style); 
document.getElementById('btn_sound').className=new_style;
}
//*****************************
//function findSubject(id) {
//*****************************	
//var findFromArray="";
//var l=subjects.length;
//for (i=0;i!=l;i++)
//	if (subjects[i].id==id) 
//	{
//	findFromArray=subjects[i].name;
//	break;	
//	}	
//return 	findFromArray;
//}
		
