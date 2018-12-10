//-> Учитывать день недели
var version="1.0 10122018";
var debug=true;
var lastDateTime= new Date();
var curDateTime= new Date(lastDateTime.getTime());
//var bells = new Array();
var bells =[];//Object Definition https://www.w3schools.com/js/js_objects.asp
var idLesson=-1;
var idLessonNext=-1;
var idLessonPrevios=-1;
var LessonDuration=0;
var Calendar_Status=-1; //-1 - undefined, 0-timeoff, 1-Lesson, 2-break
var DateTime_NextStatus = new Date(lastDateTime.getFullYear(), lastDateTime.getMonth(), lastDateTime.getDate(), 23, 59);
var DateTime_PreviosStatus = new Date(lastDateTime.getFullYear(), lastDateTime.getMonth(), lastDateTime.getDate(), 0, 0);
var WindowOrientation=1   ;//0-Landscape, 1-Portrait https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
var ClockColon=true;
const strLesson="Урок";
const strBreak="Перемена";
const strTimeoff="Нерабочее время";
var sound =false;
const color_status="#FFAAAA";
const color_NOstatus="#FFFFFF";
var TimeSpend =0;
var TimeRest  =0;

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
	if (sound)
	{var a=document.getElementById("soundbell");a.play();}
	}
document.getElementById('Calendar_TimeFrom').innerHTML=GetTimeHM(DateTime_PreviosStatus);
document.getElementById('Calendar_TimeTo').innerHTML=GetTimeHM(DateTime_NextStatus);
TimeSpend=Math.floor((curDateTime-DateTime_PreviosStatus)/60000);
TimeRest=Math.ceil((DateTime_NextStatus-curDateTime)/60000);
document.getElementById('Calendar_TimeSpend').innerHTML=TimeSpend;
document.getElementById('Calendar_TimeRest').innerHTML=TimeRest;
document.getElementById("Lesson_progess").value=TimeSpend;
document.getElementById("Lesson_progess").max=LessonDuration;


if (lastDateTime.getDate()!=curDateTime.getDate())
	{ 
	//-> В массиве bells увеличить дату на сутки
	lastDateTime=Date();
	render_date();
	}	
}
//***************************** 
function render_date() {
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
if (debug)console.log("DEBUG ON");
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
//if (debug)console.log(bell);
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
			STARTTIME=new Date(bells[i-1].ENDTIME.getTime()+60000+Math.floor(Math.random()*280*1000));		
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
LessonDuration=(DateTime_NextStatus-DateTime_PreviosStatus)/60000;
if (debug) console.log("LessonDuration",LessonDuration);
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
//document.getElementById("r_Timetable_"+id-1).bgColor="#FFFFFF";
//document.getElementById("r_Timetable_"+id).style="border-bottom: 2pt solid #FFAAAA;";
//document.getElementById("r_Timetable_"+i).style.borderBottom="thick solid #FF0000";
	//document.getElementById("r_Timetable_"+i).style.borderBottomStyle="solid";	
	//document.getElementById("r_Timetable_"+i).style= "border: thick solid #FF0000;"
	//cell1.style.borderBottomStyle="solid";
	
	
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
}
//*****************************	
function render_timetable(){
//*****************************
var tbl = document.getElementById("tbl_timetable");
for (i=0;i!=bells.length-1;i++)
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
	//document.getElementById("r_Timetable_"+i).style.borderBottom="thick solid #FF0000";
	//document.getElementById("r_Timetable_"+i).style.borderBottomStyle="solid";	
	//document.getElementById("r_Timetable_"+i).style= "border: thick solid #FF0000;"
	//cell1.style.borderBottomStyle="solid";
	}
}


		
