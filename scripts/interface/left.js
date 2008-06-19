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


/**
* Create elements of the left side
* of screen
*/
function INTERFACE_CreateLeft()
{
	var Left, UserBox, Rooms, ContactList;

	Left = UTILS_CreateElement("div", "Left");
	UserBox = INTERFACE_CreateUserBox();
	ContactList = INTERFACE_CreateContact();
	Rooms = INTERFACE_CreateRooms();

	Left.appendChild(UserBox);
	Left.appendChild(ContactList);
	Left.appendChild(Rooms);

	return Left;
}

/**
* Create user box (left side of the screen)
*/
function INTERFACE_CreateUserBox()
{
	var UserDiv, UserImg, UserInf, Name, Status, StatusItem;
	var Hr, Profile;
	var UserType;

	UserType = MainData.Type;

	if (!UserType)
	{
		UserType = "user";
	}
 
	UserDiv = UTILS_CreateElement("div", "User");
	UserImg = UTILS_CreateElement("img","UserImg");
	UserImg.title = MainData.Username;
	UserImg.src = "images/no_photo.png";

	try 
	{
		// If user dont have received profile photo yet
		if (MainData.Photo == undefined)
			throw "No_Photo";

		UserImg.src = MainData.Photo;
	}
	catch (e) {
		UserImg.src = "images/no_photo.png";
	}

	UserInf = UTILS_CreateElement("div", "UserInf");
	Name = UTILS_CreateElement("h2", null, null, MainData.Username);
	Status = UTILS_CreateElement("select", "UserStatusSelect");

	// Available
	StatusItem = UTILS_CreateElement("option", null, UserType+"_available", "("+UTILS_Capitalize(UTILS_GetText("status_available"))+")");
	StatusItem.value = "available";
	Status.appendChild(StatusItem);

	// Unavailable
	StatusItem = UTILS_CreateElement("option", null, UserType+"_unavailable", "("+UTILS_Capitalize(UTILS_GetText("status_unavailable"))+")");
	StatusItem.value = "unavailable";
	Status.appendChild(StatusItem);

	// Busy
	StatusItem = UTILS_CreateElement("option", null, UserType+"_busy", "("+UTILS_Capitalize(UTILS_GetText("status_busy"))+")");
	StatusItem.value = "busy";
	Status.appendChild(StatusItem);

	// Away
	StatusItem = UTILS_CreateElement("option", null, UserType+"_away", "("+UTILS_Capitalize(UTILS_GetText("status_away"))+")");
	StatusItem.value = "away";
	Status.appendChild(StatusItem);

	Status.onchange = function () { CONTACT_ChangeStatus(this.value) };

	Hr = UTILS_CreateElement("hr");

	Profile = UTILS_CreateElement("span",null,null,UTILS_GetText("contact_change_profile"));
	UTILS_AddListener(Profile,"click", function() { PROFILE_StartProfile(MainData.Username); }, "false");

	UserInf.appendChild(Name);
	UserInf.appendChild(Status);
	UserInf.appendChild(Hr);
	UserInf.appendChild(Profile);
	UserDiv.appendChild(UserImg);
	UserDiv.appendChild(UserInf);

	return UserDiv;
}


/**
* Change user's image
*/
function INTERFACE_SetUserImage(Img)
{
	var UserImg = document.getElementById("UserImg");

	if ((UserImg != null) && (Img != "images/no_photo.png"))
	{
		UserImg.src = IMAGE_ImageDecode(Img);
	}
}
