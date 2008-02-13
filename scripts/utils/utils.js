/**
* CHESSD - WebClient
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*/


/**
* Utils for webclient
*/


/**********************************
 * FUNCTIONS - XML SEARCH
 ************************************/

/**
* Identify client web browser
*/

function UTILS_IdentifyBrowser()
{
	var BrowserValue;
	var BrowserName=navigator.appName;


	// Firefox, Mozilla, Opera, etc.
	if (BrowserName.match("Netscape"))
	{
		BrowserValue = 1;
	}
	// Explorer
	else if (BrowserName.match("Microsoft Internet Explorer"))
	{
		BrowserValue = 0;
	}
	// Other
	else
	{
		alert("Seu navegador pode n�o funcionar corretamente nesse site");
		BrowserValue = -1;
	}

	return BrowserValue;
}

/**
* Open a XML file and return XML DOM Tree
*/
function UTILS_OpenXMLFile(Url)
{	
	var XML, Parser;

	// Code for IE
	if (window.ActiveXObject)
	{
		XML = new ActiveXObject("Microsoft.XMLDOM");
	}
	// Code for Mozilla, Firefox, Opera, etc.
	else if (document.implementation && document.implementation.createDocument)
	{
		XML = document.implementation.createDocument("","",null);
	}
	else
	{
		alert('Seu navegador nao suporta XML DOM.');
	}

	XML.async = false;
	XML.load(Url);

	return(XML);
}


/**
* Return content of param
*/
function UTILS_GetTag(XML, TagName)
{
	var Node = XML.getElementsByTagName(TagName);

	// If dont find any tag
	if (Node == null)
	{
		return null;
	}
	// Return only first match
	else
	{
		Node = Node[0];
	}

	return UTILS_GetNodeText(Node);
}


/**
* Get Text for internacionalization
*/
function UTILS_GetText(TagName)
{
	return UTILS_GetTag(MainData.GetText, TagName);
}


/**
* Get param name for any browser
*/
function UTILS_GetNodeText(Node)
{
	if (!Node)
		return null;

	// Internet Explorer
	if (Node.text)
	{
		return Node.text;
	}
	// Mozilla, firefox, galeon
	else
	{
		return Node.textContent;
	}
}


/**********************************
 * FUNCTIONS - ELEMENT MANIPULATION
 ************************************/

function UTILS_CreateElement(Element, Id, ClassName, Inner)
{
	try
	{
		var Node = document.createElement(Element);
	}
	catch(e)
	{
		return null
	}

	if (Id != null)
		Node.id = Id;

	if (ClassName != null)
		Node.className = ClassName;

	if (Inner != null)
		Node.innerHTML = Inner;

	return Node;
}


/**********************************
 * FUNCTIONS - COOKIE MANIPULATION
 ************************************/

/**
* Create cookies
*/
function UTILS_CreateCookie(CookieName,CookieValue,Days)
{
	var Expires, Data;

	if (Days)
	{
		Data = new Date();
		Data.setTime(Data.getTime()+(Days*24*60*60*1000));
		Expires = "; expires="+Data.toGMTString();
	}
	else 
		Expires = "";

	document.cookie = CookieName+"="+CookieValue+Expires;
}

/**
* Read cookies
*/
function UTILS_ReadCookie(CookieName)
{
	var Cookies = document.cookie.split("; ");

	for (var i=0; i<Cookies.length; i++)
	{
		if (Cookies[i].search(CookieName) != -1)
			return Cookies[i].replace(CookieName+"=","");
	}
	return "";
}

/**
* Erase cookies
*/
function UTILS_DeleteCookie(CookieName)
{
	UTILS_CreateCookie(CookieName,"",-1);
}

/**********************************
 * FUNCTIONS - VALIDATION
 ************************************/

/**
* Validate username
*/
function UTILS_ValidateUsername(Username)
{
	if (Username.match(/[^0-9a-z-_.]{1,}/))
	{
		return false;
	}
	else
	{
		return true;
	}
}

/**
* Capitalize a word
*/
function UTILS_Capitalize(Word)
{
	return Word[0].toUpperCase() + Word.slice(1);
}


/**********************************
 * FUNCTIONS - EVENT LISTENERS
 ************************************/

/**
* Add a Element event listener
* SRC = http://snipplr.com/view/561/add-event-listener/
* Cross-browser implementation of Element.addEventListener()
*/
function UTILS_AddListener(Element, Type, Expression, Bubbling)
{
	Bubbling = Bubbling || false;

	if (window.addEventListener) // Standard
	{
		Element.addEventListener(Type, Expression, Bubbling);
		return true;
	} 
	else if(window.attachEvent) // IE
	{
		Element.attachEvent('on' + Type, Expression);
		Element.cancelBubble = !(Bubbling);
		return true;
	} 
	else
	{ 
		return false;
	}
}

/**
* Remove an event listener
*/
function UTILS_RemoveListener(Element, Type, Expression, Bubbling)
{
	Bubbling = Bubbling || false;

	if (window.addEventListener) // Standard
	{
		Element.removeEventListener(Type, Expression, Bubbling);
		return true;
	} 
	else if(window.attachEvent) // IE
	{
		Element.detachEvent('on' + Type, Expression);
		Element.cancelBubble = !(Bubbling); // ??? TODO -> precisa tirar isso?
		return true;
	} 
	else
	{ 
		return false;
	}
}


/**********************************
 * FUNCTIONS - CROSS BROWSER EVENT
 ************************************/

function UTILS_ReturnEvent(event)
{
	if(MainData.Browser == 1) // Firefox
	{
		return event;
	}
	else //IE
	{
		return window.event;
	}
}


/**********************************
 * FUNCTIONS - TIME CONVERSION
 ************************************/

/**
* Return time in format (XXhXX) from a given timestamp
* If timestamp is null, return current time
*/
function UTILS_GetTime(Timestamp)
{
	var Offset, Time, Hour, Min, Now, NewTime;


	Now = new Date();

	if (Timestamp)
	{
		Offset = Now.getTimezoneOffset()/60;
		Time = Timestamp.split("T")[1];
		Hour = (Time.split(":")[0] - Offset + 24) % 24;
		Min = Time.split(":")[1];

		NewTime = "("+Hour+"h"+Min+")";
	}
	else
	{
		NewTime = "("+Now.getHours()+"h";

		// Insert zero before minutes < 10
		if (Now.getMinutes() < 10)
		{
			NewTime += "0"+Now.getMinutes();
		}
		else
		{
			NewTime += Now.getMinutes();
		}
		NewTime += ")";
	}
	return NewTime;
}
/************************************
 * FUNCTIONS - OBJECT OFFSETS       *
 ************************************/
/*
* Return object offsets (top and left)
*/
function UTILS_GetOffset(Obj)
{
	var Curleft, Curtop;

	if (Obj.offsetParent) 
	{
		Curleft = Obj.offsetLeft;
		Curtop = Obj.offsetTop;
		while (Obj = Obj.offsetParent)
		{
			Curleft += Obj.offsetLeft
			Curtop += Obj.offsetTop
		}
	return {X:Curleft, Y:Curtop};
	}
}


/**********************************
 * FUNCTIONS - DRAG AND DROP
 ************************************/
//TODO TODO TODO TODO TODO TODO
// SUBSTITUIR ESSAS FUNCOES DE DRAG AND DROPS
//TODO TODO TODO TODO TODO TODO

/**
*
* DRAG AND DROP DAS PE�AS
*
* @private
*/

var SQUARE_OVER = false;


function UTILS_DragPiece(event,Obj,OffsetX,OffsetY)
{
	var X = event.pageX - OffsetX;
	var Y = event.pageY - OffsetY;
	if (Obj)
	{
		Obj.style.top = Y + "px";
		Obj.style.left = X + "px";
	}
}

function UTILS_StartDragPiece(Obj)
{
//	if (!TURN)
///		return;

	Obj.style.position = "absolute";
	OffsetX = Obj.offsetParent.offsetLeft - 1;
	OffsetY = Obj.offsetParent.offsetTop + 10;
	document.onmousemove = function(event) { UTILS_DragPiece(event,Obj,OffsetX,OffsetY); };
	document.onmouseup = function() { document.onmousemove = false; document.onmouseup = false; UTILS_DropObject(Obj); };
}

function UTILS_DropObject(Obj)
{
	//ARRUMAR ISSO AKI!!!
	var Move;
	//var CurrentGame = GAME_Game_FindGameByGameId(MainData.CurrentGame);
	var CurrentGamePos = MainData.CurrentGame; //Posicao do jogo na estrutura de jogos
	var Curleft = 0;
	var Curtop = 0;
	//MODO TUTOR
	var TUTOR_MODE = 0;
	//var Color = MainData.BoardList[CurrentGame].Color;
	var Turn;

	if(MainData.Turn=='w')
		Turn = 0;
	else
		Turn = 1;

	Img = document.createElement('img');
	Img.src = Obj.src;
	Img.onmousedown = function() { UTILS_StartDragPiece(this); return false; };
	
	// Se arrastar a peca em cima de uma casa
	if (SQUARE_OVER)
	{	
		//Pega as posicoes de origem e destino do movimento
		Move = Obj.parentNode.id + SQUARE_OVER.id;

		// Faz a pre-validacao da jogada antes de enviar ao servidor
		if (!GAME_MovePreValidate(MainData.BoardList[CurrentGamePos].Board,MainData.BoardList[CurrentGamePos].Color,MainData.BoardList[CurrentGamePos].Turn,Move,MainData.BoardList[CurrentGamePos].Hook))
		{
			Obj.style.position = "static";
			return;
		}
		
		// Atualiza o tabuleiro armazenado
		//UTILS_UpdateBoard(Turn);
		/*
		if (TUTOR_MODE == 1)
		{
			Obj.parentNode.removeChild(Obj);
			SQUARE_OVER.innerHTML = "";
 			SQUARE_OVER.appendChild(Img);
			//MUDAR O TABULEIRO
		}
		*/
		else
		{
			//Obj.style.position = "static";
			// Deixa a peca mesmo que o movimento seja invalido
			Obj.style.position = "static";
			//Obj.parentNode.removeChild(Obj);
			//SQUARE_OVER.appendChild(Obj);

			GAME_SendMove(Move);
		}

		// Envia a jogada ao servidor
		//Move = false;
	}
	else
	{
		// retorna a posicao original
		Obj.style.position = "static";
	}
}

function UTILS_OnOverSquare(Obj)
{
	SQUARE_OVER = Obj;
}

function UTILS_OnOutSquare()
{
	SQUARE_OVER = false;
}


function UTILS_DragWindow(Obj)
{
	Obj.style.position = "absolute";
	OffsetX = Obj.offsetParent.offsetLeft;
	OffsetY = Obj.offsetParent.offsetTop;
	document.onmousemove = function(event) { UTILS_DragPiece(event,Obj,OffsetX,OffsetY); };
	document.onmouseup = function() { 
		document.onmousemove = false;
		document.onmouseup = false;
		
	};
}

//TODO TODO TODO TODO TODO TODO
// SUBSTITUIR ESSAS FUNCOES DE DRAG AND DROPS
//TODO TODO TODO TODO TODO TODO
