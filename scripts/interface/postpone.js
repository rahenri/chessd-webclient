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
*
* C3SL - Center for Scientific Computing and Free Software
*/

/*
* @file		interface/postpone.js
* @brief	Contains all functions to create and manage postpone elements
*/

/**
* @brief	Create elements to postpone invite window content
*
* @param	Oponent		Oponent's name
* @param	RatingObj	Oponent's rating object
* @param	GameParameters	Object that contains the game parameters 
* @param	Rated		Rated game flag
* @param	MatchId		Postponed game identification number
* @return	Postpone window content Div and Buttons Array
* @author	Danilo Kiyoshi Simizu Yorinori
*/
function INTERFACE_ShowPostponeWindow(Oponent, RatingObj, GameParameters, Rated, MatchId)
{
	var Div;

	var TopDiv;
	var Username, RatingLabel, Label;

	var Layer1Div;
	var L1LeftDiv;
	var ColorLabel, ColorOptW,BrW, ColorOptWImg, ColorOptB, ColorOptBImg,BrB, AutoColorOpt, AutoColorLabel, RandomColorOptImg, BrR;
	var L1RightDiv;
	var CatLabel, CatSelect, CatOptLi, CatOptBl, CatOptSt, CatOptUt;
	var Br1;

	var Layer2Div;
	var L2LeftDiv;
	var TimeLabel, TimeSelect, TimeOpt, TimeLabelMin,TimeBr;
	var L2RightDiv;
	var IncLabel, IncSelect, IncOpt, IncLabelSeg,IncBr;
	var Br2;

	var ChalRightDiv;

	var Layer3Div;
	var Layer3IDiv;
	var RatingCheckbox, RatingLabel;
	var PrivateCheckbox, PrivateLabel;
	var AutoFlagCheckbox, AutoFlagLabel;
	var Br3, Br4;

	var ButtonsDiv;
	var Invite, Accept, Decline, NewParameters, Cancel, Chat;
	var Buttons = new Array();

	var Type, Color;
	var i; 
	var Rating;

	// Main Div
	Div = UTILS_CreateElement('div', 'ChallengeDiv');
	
	// Top Elments
	TopDiv = UTILS_CreateElement('div', 'TopDiv');
	Username = UTILS_CreateElement('h3', null, null, Oponent);
	RatingLabel = UTILS_CreateElement('span',null,'rating',"Rating: "+RatingObj.GetRatingValue("blitz"));
	Username.appendChild(RatingLabel);
	Label = UTILS_CreateElement('p', null, 'label_information', UTILS_GetText('postpone_information'));
	

	// Layer1 Elements

	Layer1Div = UTILS_CreateElement('div', 'Layer1Div');
	// Layer 1 Left Elements
	L1LeftDiv = UTILS_CreateElement('div', 'L1LeftDiv','leftDiv');

	ColorLabel = UTILS_CreateElement('p',null,null,UTILS_GetText('challenge_my_pieces'));

	try
	//Fix radio button for IE
	{
		ColorOptW = document.createElement('<input class="radio" type="radio" name="color" />');
	}
	catch(err)
	{ //FF
		ColorOptW =	UTILS_CreateElement('input',null);
		ColorOptW.type = "radio";
		ColorOptW.name = "color";
		ColorOptW.value = "colorW";
	}
	

	ColorOptWImg = UTILS_CreateElement('img',null,'color');
	BrW = UTILS_CreateElement('br');

	try
	//Fix radio button for IE
	{
		ColorOptB = document.createElement("<input class='radio' type='radio' name='color' />")
	}
	catch(err)
	{ //FF
		ColorOptB = UTILS_CreateElement('input',null);
		ColorOptB.type = "radio";
		ColorOptB.name = "color";
		ColorOptB.value = "colorB";
	}
	ColorOptBImg = UTILS_CreateElement('img',null,'color');
	BrB = UTILS_CreateElement('br');
	
	try
	//Fix radio button for IE
	{
		AutoColorOpt = document.createElement("<input class='radio' type='radio' name='color' />")
	}
	catch(err)
	{ //FF
		AutoColorOpt = UTILS_CreateElement('input',null,'radio');
		AutoColorOpt.type = "radio";
		AutoColorOpt.name = "color";
		AutoColorOpt.value = "auto";
	}

	RandomColorOptImg = UTILS_CreateElement('img',null,'color');
	BrR = UTILS_CreateElement('br');
	
	// Set imagens according to browser type
	if (MainData.GetBrowser() == 0)
	{
		ColorOptWImg.src = "images/ie/invite_white_pawn.gif";
		ColorOptBImg.src = "images/ie/invite_black_pawn.gif";
		RandomColorOptImg.src = "images/ie/random.gif";
	}
	else
	{
		ColorOptWImg.src = "images/invite_white_pawn.png";
		ColorOptBImg.src = "images/invite_black_pawn.png";
		RandomColorOptImg.src = "images/random.png";
	}
//	AutoColorLabel= UTILS_CreateElement("span",null,null,UTILS_GetText("challenge_color_auto"));

	// Select player color
	if (GameParameters.Color == "white")
	{
		// Firefox fix
		ColorOptB.checked = true;
		//defaultChecked is used to fix IE radio checked
		ColorOptB.setAttribute("defaultChecked", "true");
	}
	else if (GameParameters.Color == "black")
	{
		// Firefox fix
		ColorOptW.checked = true;
		//defaultChecked is used to fix IE radio checked
		ColorOptW.setAttribute("defaultChecked", "true");
	}
	else
	{
		// Firefox fix
		AutoColorOpt.checked = true;
		//defaultChecked is used to fix IE radio checked
		AutoColorOpt.setAttribute("defaultChecked", "true");
	}
	//*End Layer 1 Left Elements*
	
	// Layer 1 Right Elements
	L1RightDiv = UTILS_CreateElement('div', 'L1RightDiv');

	CatLabel = UTILS_CreateElement('p', null, null, UTILS_GetText('challenge_category'));
	CatOptLi = UTILS_CreateElement('option', null, null, 'Lightning');
	CatOptLi.value = "lightning";
	CatOptBl = UTILS_CreateElement('option', null, null, 'Blitz');
	CatOptBl.value = "blitz";
	CatOptSt = UTILS_CreateElement('option', null, null, 'Standard');
	CatOptSt.value = "standard";
	
	// UNTIMED category option
	CatOptUt = UTILS_CreateElement('option', null, null, 'Untimed');
	CatOptUt.value = "untimed";

	CatSelect =	UTILS_CreateElement('select',null,'drop_select');
	CatSelect.appendChild(CatOptLi);
	CatSelect.appendChild(CatOptBl);
	CatSelect.appendChild(CatOptSt);
	
	//Append untimed option
	CatSelect.appendChild(CatOptUt);


	//* End Layer1 Right Elements*
	
	Br1= UTILS_CreateElement('br');

	//* End Layer1*

	// Layer 2 Elements
	Layer2Div = UTILS_CreateElement('div','Layer2Div');

	// Layer 2 Right Elements
	L2RightDiv = UTILS_CreateElement('div','L2RightDiv');
	IncLabel =	UTILS_CreateElement('p', null, null, UTILS_GetText('challenge_inc_label'));
	IncSelect = UTILS_CreateElement('select', null, 'drop_select');
	IncLabelSeg =	UTILS_CreateElement('span', null, 'italic', UTILS_GetText('challenge_inc_label_seg'));
	IncBr = UTILS_CreateElement('br');
	
	for (i=0; i < 30; i++)
	{
		IncOpt = UTILS_CreateElement("option", null, null, i);
		IncOpt.value = i;

		IncSelect.appendChild(IncOpt);
	}
	
	// Setting the inc received
	if (GameParameters != null)
	{
		IncSelect.selectedIndex = GameParameters.Inc;
	}

	//* End Layer2 Right Elements*
	
	// L2 Left Elements
	L2LeftDiv = UTILS_CreateElement('div','L2LeftDiv','leftDiv');

	TimeLabel =	UTILS_CreateElement('p',null,null,UTILS_GetText('challenge_time_label'));
	TimeLabelMin =	UTILS_CreateElement('span',null,'italic',UTILS_GetText('challenge_time_label_min'));
	TimeBr = UTILS_CreateElement('br');
	TimeSelect = UTILS_CreateElement('select',null,'drop_select');


	// Receive challenge from another player	
	if (GameParameters.Time)
	{
		// Lightning
		if (GameParameters.Time<=2)
		{
			for (i=1; i <= 2; i++)
			{
				TimeOpt = UTILS_CreateElement('option',null,null,i);
				TimeOpt.value = i;

				TimeSelect.appendChild(TimeOpt);
			}	
			CatSelect.options.selectedIndex = 0;

			TimeSelect.options.selectedIndex = GameParameters.Time - 1;
		}
		// Blitz
		else if ((GameParameters.Time>=3) && (GameParameters.Time<=10))
		{
			for (i=3; i <= 10; i++)
			{
				TimeOpt = UTILS_CreateElement('option',null,null,i);
				TimeOpt.value = i;

				TimeSelect.appendChild(TimeOpt);
			}	

			CatSelect.options.selectedIndex = 1;

			TimeSelect.options.selectedIndex = GameParameters.Time - 3;
		}

		// Standard
		else if (GameParameters.Time>=11)
		{
			for (i=11; i <= 30; i++)
			{
				TimeOpt = UTILS_CreateElement('option',null,null,i);
				TimeOpt.value = i;

				TimeSelect.appendChild(TimeOpt);
			}	
			TimeOpt = UTILS_CreateElement('option',null,null,"40");
			TimeOpt.value = 40;
			TimeSelect.appendChild(TimeOpt);
			TimeOpt = UTILS_CreateElement('option',null,null,"60");
			TimeOpt.value = 60;
			TimeSelect.appendChild(TimeOpt);
			TimeOpt = UTILS_CreateElement('option',null,null,"120");
			TimeOpt.value = 120;
			TimeSelect.appendChild(TimeOpt);
			TimeOpt = UTILS_CreateElement('option',null,null,"180");
			TimeOpt.value = 180;
			TimeSelect.appendChild(TimeOpt);
			TimeOpt = UTILS_CreateElement('option',null,null,"190");
			TimeOpt.value = 190;
			TimeSelect.appendChild(TimeOpt);

			
			// Select option
			CatSelect.options.selectedIndex = 2;
			if (GameParameters.Time <= 30)
			{
				TimeSelect.options.selectedIndex = GameParameters.Time - 11;
			}
			else if (GameParameters.Time == 40) 
			{
				TimeSelect.options.selectedIndex = 20;
			}
			else if (GameParameters.Time == 60) 
			{
				TimeSelect.options.selectedIndex = 21;
			}
			else if (GameParameters.Time == 120) 
			{
				TimeSelect.options.selectedIndex = 22;
			}
			else if (GameParameters.Time == 180) 
			{
				TimeSelect.options.selectedIndex = 23;
			}
			else if (GameParameters.Time == 190) 
			{
				TimeSelect.options.selectedIndex = 24;
			}
		}
		else if (GameParameters.Time == "untimed")
		{
			TimeOpt = UTILS_CreateElement('option',null,null,"&#8734");
			TimeOpt.value = "untimed";
			TimeSelect.appendChild(TimeOpt);

			CatSelect.options.selectedIndex = 3;
			TimeSelect.options.selectedIndex = 0;
		
			// Disable select time and select increment
			TimeSelect.disabled = true;
			IncSelect.disabled = true;
		}
	}

	//* End Layer2 Left Elements*
	Br2= UTILS_CreateElement('br');
	// End Layer 2
	
	// Layer 3
	Layer3Div = UTILS_CreateElement('div','Layer3Div');
	Layer3IDiv = UTILS_CreateElement('div','Layer3IDiv','leftDiv');

	// Private
	try
	{
		PrivateCheckbox = document.createElement("<input class='rating_radio' type='checkbox' name='private' disabled='disabled' />");
	}
	catch(err)
	{
		PrivateCheckbox =	UTILS_CreateElement('input', null, 'rating_radio');
		PrivateCheckbox.type = "checkbox";
		PrivateCheckbox.name = "private";
		PrivateCheckbox.disabled = true;
	}
	PrivateLabel = UTILS_CreateElement('span',null,'cx',UTILS_GetText('challenge_private'));
	
	// Rating
	if (Rated != undefined)
	{
		if (Rated == "true")
		{
			try
			{
				RatingCheckbox = document.createElement("<input class='rating_radio' checked='checked'  type='checkbox' name='rating' />");
			}
			catch(err)
			{
				RatingCheckbox = UTILS_CreateElement('input',null,'rating_radio');
				RatingCheckbox.type = "checkbox";
				RatingCheckbox.name = "rating";
				RatingCheckbox.checked = true;
			}
		}
		else
		{
			try
			{
				RatingCheckbox = document.createElement("<input class='rating_radio' type='checkbox' name='rating' />");
			}
			catch(err)
			{
				RatingCheckbox = UTILS_CreateElement('input',null,'rating_radio');
				RatingCheckbox.type = "checkbox";
				RatingCheckbox.name = "rating";
				RatingCheckbox.checked = false;
			}
		}
	}
	else
	{
		try
		{
			RatingCheckbox = document.createElement("<input class='rating_radio' checked='checked'  type='checkbox' name='rating' />")
		}
		catch(err)
		{
			RatingCheckbox = UTILS_CreateElement('input',null,'rating_radio');
			RatingCheckbox.type = "checkbox";
			RatingCheckbox.name = "rating";
			RatingCheckbox.checked = true;
		}
	}
	RatingLabel = UTILS_CreateElement('span',null,'cx',UTILS_GetText('challenge_rating'));

	// Auto-flag
	AutoFlagCheckbox = UTILS_CreateElement('input',null,'rating_radio');
	AutoFlagCheckbox.type = "checkbox";
	AutoFlagCheckbox.name = "autoflag";
	AutoFlagCheckbox.disabled = true;
	AutoFlagLabel = UTILS_CreateElement('span',null,'cx',UTILS_GetText('challenge_auto_flag'));

	Br3 = UTILS_CreateElement('br');
	Br4 = UTILS_CreateElement('br');
	//*End Layer 3 Elements*

	// Bottom Elements

	ButtonsDiv = UTILS_CreateElement('div', 'ButtonsDiv');


	// Accept challenge
	// Only if you receive a challenge
	Accept = UTILS_CreateElement('input',null,'button');
	Accept.value = UTILS_GetText('window_accept');
	Accept.type = "button";
	Accept.onclick = function () {
		CHALLENGE_AcceptChallenge(MatchId);
	}	

	// SET CHAT EVENT
	Chat = UTILS_CreateElement('input',null,'button');
	Chat.value = UTILS_GetText('challenge_chat');
	Chat.type = "button";
	Chat.onclick = function () {
		CHAT_OpenChat(Oponent);
	}

	// SET DECLINE EVENT
	Decline = UTILS_CreateElement('input',null,'button');
	Decline.value = UTILS_GetText('window_decline');
	Decline.type = "button";
	Decline.onclick = function () {
		CHALLENGE_DeclineChallenge(MatchId);
	}	

	// DISABLE INPUTS
	TimeSelect.disabled = true;
	IncSelect.disabled = true;
	RatingCheckbox.disabled = true;
	CatSelect.disabled = true;
	ColorOptW.disabled = true;
	ColorOptB.disabled = true;
	AutoColorOpt.disabled = true;

	// Appending childs

	// Layer1
	// Left
	L1LeftDiv.appendChild(ColorLabel);
	L1LeftDiv.appendChild(ColorOptW);
	L1LeftDiv.appendChild(ColorOptWImg);
	L1LeftDiv.appendChild(BrW);
	L1LeftDiv.appendChild(ColorOptB);
	L1LeftDiv.appendChild(ColorOptBImg);
	L1LeftDiv.appendChild(BrB);
	L1LeftDiv.appendChild(AutoColorOpt);
	L1LeftDiv.appendChild(RandomColorOptImg);
	L1LeftDiv.appendChild(BrR);
//	L1LeftDiv.appendChild(AutoColorLabel);
	
	// Right
	L1RightDiv.appendChild(CatLabel);
	L1RightDiv.appendChild(CatSelect);

	Layer1Div.appendChild(L1LeftDiv);
	Layer1Div.appendChild(L1RightDiv);

	// Layer2
	// Left
	L2LeftDiv.appendChild(TimeLabel);
	L2LeftDiv.appendChild(TimeSelect);
	L2LeftDiv.appendChild(TimeLabelMin);
	L2LeftDiv.appendChild(TimeBr);

	// Right
	L2RightDiv.appendChild(IncLabel);
	L2RightDiv.appendChild(IncSelect);
	L2RightDiv.appendChild(IncLabelSeg);
	L2RightDiv.appendChild(IncBr);
	
	Layer2Div.appendChild(L2LeftDiv);
	Layer2Div.appendChild(L2RightDiv);

	// Layer3
	Layer3IDiv.appendChild(RatingCheckbox);
	Layer3IDiv.appendChild(RatingLabel);
	Layer3IDiv.appendChild(Br4);
	Layer3IDiv.appendChild(PrivateCheckbox);
	Layer3IDiv.appendChild(PrivateLabel);

	Layer3Div.appendChild(Layer3IDiv);

	// Disabled
//	Layer3Div.appendChild(AutoFlagCheckbox);
//	Layer3Div.appendChild(AutoFlagLabel);

	// Buttons
	ButtonsDiv.appendChild(Accept);
	Buttons.push(Accept);
	ButtonsDiv.appendChild(Chat);
	Buttons.push(Chat);
	ButtonsDiv.appendChild(Decline);
	Buttons.push(Decline);

	// TopDiv
	TopDiv.appendChild(Username);
	if (GameParameters != undefined)
	{
		TopDiv.appendChild(Label);
	}
	

	// Mount Main Div
	Div.appendChild(TopDiv);
	Div.appendChild(Layer1Div);
	Div.appendChild(Br1);
	Div.appendChild(Layer2Div);
	Div.appendChild(Br2);
	Div.appendChild(Layer3Div);
	Div.appendChild(Br3);
	Div.appendChild(ButtonsDiv);

	return {Div:Div, Buttons:Buttons}
}

