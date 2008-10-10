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
* Room controller
*/


/*********************************
 * FUNCTIONS - PARSERS
 *********************************/
/**
* Handle all presence from a room;
*
* @param 	XML The xml come from server with tag presence
* @return 	void
* @author 	Ulysses
*/
function ROOM_HandleRoomPresence(XML)
{
	var From, RoomName, Jid, Type, Item, Role, Affiliation, Show, Status, MsgTo, NewRoom = false;
	var Room;
	var Buffer = "";

	var Component;
	
	var LoadingBox;

	var RoomNotFound;

	// Get Attributes from XML
	Item = XML.getElementsByTagName("item");
	Show = XML.getElementsByTagName("show");
	From = XML.getAttribute('from');
	Type = XML.getAttribute('type');
	RoomName = From.replace(/@.*/, "");
	Jid = From.replace(/.*\//, "");
	MsgTo = From.replace(/\/.*/, "");

	Component = From.split("@")[1].split("/")[0].split(".")[0];


	// Check if the type is an error
	if (Type == "error")
	{
		// Check if error is a inexist room; -> QuickFix to close room
		RoomNotFound = XML.getElementsByTagName("item-not-found")[0];

		if(RoomNotFound != null)
		{
			ROOM_RemoveRoom(RoomName);
		}

		return Buffer;
	}

	if(Item.length > 0)
	{
		Role = Item[0].getAttribute("role");
		Affiliation = Item[0].getAttribute("affiliation");
	}
	else
	{
		Role = "participant";
		Affiliation = "none";
	}

	// Remove loading box if user enter in general room;
	if(RoomName == MainData.GetRoomDefault())
	{
		LoadingBox = document.getElementById("room_loading");
		if(LoadingBox != null)
		{
			LoadingBox.parentNode.removeChild(LoadingBox);
		}
	}


	// Status of user
	if (Show.length > 0)
	{
		// Get status name
		Status = UTILS_GetNodeText(Show[0]);

		// Any different status, status = away
		if ((Status != "busy") && (Status != "away") && (Status != "unavailable") && (Status != "playing"))
		{
			Status = "away";
		}
	}
	// If tag 'show' doesnt exists, status online
	else
	{
		Status = "available";
	}

	// If 'RoomName' doesnt exists, insert it in strucutre
	// and show on the interface
	if (MainData.FindRoom(RoomName) == null)
	{
		ROOM_CreateRoom(RoomName);

		// Show room user list if room is a room game
		if(Component == MainData.GetServer())
		{
			Room = MainData.GetRoom(RoomName);
			Room.Room.showUserList();
		}
	}

	// If its your presence
	if (Jid == MainData.Username)
	{
		if (Type == "unavailable")
		{
			ROOM_RemoveRoom(RoomName);
		}
		else
		{
			// Insert you in room user list
			Buffer += ROOM_AddUser(RoomName, Jid, Status, Role, Affiliation);
			// Set your role and affiliation in data struct
			MainData.SetRoomInformation(RoomName, MsgTo, Role, Affiliation);
			INTERFACE_RefreshOccupantsNumber(RoomName);
		}
	}
	// Presence of others users
	else
	{
		if (Type == "unavailable")
		{
			ROOM_RemoveUser(RoomName, Jid);
			INTERFACE_RefreshOccupantsNumber(RoomName);
		}
		else
		{
			Buffer += ROOM_AddUser(RoomName, Jid, Status, Role, Affiliation);
			INTERFACE_RefreshOccupantsNumber(RoomName);
		}
	}
	return Buffer;
}



/**
* Handle group chat messages
*
* @param 	XML The xml come from server with tag message
* @return 	void
* @author 	Ulysses
*/
function ROOM_HandleMessage(XML)
{
	var From, RoomName, Message, Body, X, Stamp = null;


	// Get the Chat Room name
	RoomName = XML.getAttribute('from').replace(/@.*/,"");

	// Get the message sender
	From = XML.getAttribute('from').replace(/.*\//,"");

	// Get stamp (old messages)
	X = XML.getElementsByTagName('x');

	if (X.length > 0)
	{
		Stamp = X[0].getAttribute('stamp');
	}

	Body = XML.getElementsByTagName("body");

	// If there is a body
	if (Body.length > 0)
	{
		// Get the message
		Message = UTILS_GetNodeText(Body[0]);
	}

	// Show message on interface
	ROOM_ShowMessage(RoomName, From, Message, Stamp);
	
	return "";
}

/**
* Handle room list in top menu.
*
* @param 	XML The xml that the server send's
* @return 	void
* @author 	Ulysses
*/
function ROOM_HandleRoomList(XML)
{
	var Items, Rooms, Room, RoomName, ID, i;
	var Buffer = "";
	var Exp = new RegExp("^"+MainData.GetRoomDefault()+"$");
	var Consts = MainData.GetConst();

	Rooms = new Array();

	// Get the ID 
	ID = XML.getAttribute("id");
	
	// XML with all games rooms
	if (ID == Consts.IQ_ID_GetGamesList)
	{
		Buffer += ROOM_HandleGameRoomList(XML);
	}
	// Chat Room List
	else
	{
		// Get items in XML
		Items = XML.getElementsByTagName("item");
		
		// Find room names
		for (i=0; i < Items.length; i++)
		{
			Room = new Object();

			Room.Id = Items[i].getAttribute("jid").split("@")[0];
			Room.Name = Items[i].getAttribute("name").replace(/ /,"");;

			Rooms[i] = Room;

			// Change name for general room
			if (Rooms[i].Id.match(Exp))
			{
				Rooms[i].Name = UTILS_GetText("room_default") + "(" + Rooms[i].Name.split("(")[1];
			}
		}
		INTERFACE_ShowRoomList(Rooms);
	}

	INTERFACE_RemoveLoadBox();

	return Buffer;
}

/**
* Handle game room list, and resend a request for game information for each
* game.
*
* @param 	XML The xml that the server send's
* @return 	void
* @author 	Ulysses
*/
function ROOM_HandleGameRoomList(XML)
{
	var Items, i;
	var Rooms = new Array();
	var Name, WName, BName, Jid, GameId;
	var P1, P2;
	var XMPP="";

	// Get items in XML
	Items = XML.getElementsByTagName("item");

	if(Items.length == 0)
	{
		// interface/top.js
		INTERFACE_NoGamesInGameList();
	}
	else
	{
		// Get the player's names
		for (i=0; i<Items.length; i++)
		{

			Jid = Items[i].getAttribute("jid");
			GameId = Jid.split("@")[0];
			XMPP += MESSAGE_GameRoomInfoList(GameId);
		}
	}

	return XMPP;
}

/**
* Handle game room information. Get game room information and show in interface
*
* @param 	XML The xml that the server send's
* @return 	void
* @author 	Rubens
*/
function ROOM_HandleGameRoomInfoList(XML)
{
	var PW = new Object();
	var PB = new Object();

	var Iq;
	var Identity, Name;
	var Game, GameType;
	var WName, BName;
	var Jid, GameId;
	var Players;

	
	//Identity = XML.getElementsByTagName("identity")[0];
	//Name = Identity.getAttribute("name");

	Jid = XML.getAttribute("from");
	GameId = Jid.split("@")[0];

	Game = XML.getElementsByTagName("game")[0];
	GameType = Game.getAttribute("category");

	Players = XML.getElementsByTagName("player");

	//WName = Name.split(" x ")[0].split("@")[0].replace(" ","");
	//BName = Name.split(" x ")[1].split("@")[0].replace(" ","");
	if(Players[0].getAttribute("role") == "white")
	{
		PW.Name = Players[0].getAttribute("jid").split("@")[0];
		PW.Time = Players[0].getAttribute("time");
		PW.Color = "white";
		PW.Inc = Players[0].getAttribute("inc");

		PB.Name = Players[1].getAttribute("jid").split("@")[0];
		PB.Time = Players[1].getAttribute("time");
		PB.Color = "black";
		PB.Inc = Players[1].getAttribute("inc");
	}
	else
	{
		PW.Name = Players[1].getAttribute("jid").split("@")[0];
		PW.Time = Players[1].getAttribute("time");
		PW.Color = "white";
		PW.Inc = Players[1].getAttribute("inc");

		PB.Name = Players[0].getAttribute("jid").split("@")[0];
		PB.Time = Players[0].getAttribute("time");
		PB.Color = "black";
		PW.Inc = Players[0].getAttribute("inc");
	}

	// interface/room.js
	INTERFACE_ShowGameRoomList(GameId, PW, PB, GameType);

	return "";
}

/**
* Handle chess user information.
* @param XML	XMPP that contains users ratings and type.
* @author	Rubens Suguimoto
*/
function ROOM_HandleInfo(XML)
{
	var RatingNodes, TypeNodes;

        var Username, Rating, Category
	var i,j;
	var Room;
	var Status, Rating;
	var User;
	var NewType, Type;

	var RoomList = MainData.GetRoomList();
	var Room;

	RatingNodes = XML.getElementsByTagName('rating');
	TypeNodes = XML.getElementsByTagName('type');


	// Getting ratings nodes
	for (i=0 ; i<RatingNodes.length ; i++)
	{
		Username = RatingNodes[i].getAttribute('jid').replace(/@.*/,"");
		Category = RatingNodes[i].getAttribute('category');
		Rating = RatingNodes[i].getAttribute('rating');

		// Updating ratings in room lists
		for (j=0; j<RoomList.length; j++)
		{
			Room = RoomList[j];

			// Search user node in room user list
			User = Room.GetUser(Username);
			if (User != null)
			{
				// Update in data struct
				if (User.Rating.FindRating(Category) == null)
				{
					User.Rating.AddRating(Category, Rating);
				}
				else
				{
					User.Rating.SetRatingValue(Category, Rating);
				}

				Status = User.GetStatus();
				Type = User.GetType();

				// Update in interface 
				if (Category == Room.GetRoomCurrentRating())
				{
					Room.Room.userList.updateUser(Username, Status, Rating, Type);
				}
			}
		}

	}

	// Getting users type nodes
	for (i=0 ; i<TypeNodes.length ; i++)
	{
		Username = TypeNodes[i].getAttribute('jid').replace(/@.*/,"");
		NewType = TypeNodes[i].getAttribute('type');
	
		// Updating type in room lists
		for (j=0; j<RoomList.length; j++)
		{
			Room = RoomList[j];

			// Search user node in room user list
			User = Room.GetUser(Username);
			if (User != null)
			{
				// Update in data struct
				User.SetType(NewType);

				Status = User.GetStatus();
				Rating = User.Rating.GetRatingValue(Room.GetRoomCurrentRating());

				// Update in interface
				if(NewType != "user")
				{
					// Search user node in room user list
					Room.Room.userList.updateUser(Username, Status, Rating, NewType);	
				}
			}
		}
	}
	return "";
}

/**
* Send a message to room;
*
* @param 	RoomName is the room name string
* @param	Message is the message that will be send
* @return 	void
* @author 	Rubens
*/
function ROOM_SendMessage(RoomName, Message)
{
	var To, Room;

	// Search room in sctructure
	Room = MainData.GetRoom(RoomName);

	// If room doesnt exists
	if (Room == null)
	{
		return false;
	}

	// Send message to room
	To = Room.MsgTo;
	CONNECTION_SendJabber(MESSAGE_GroupChat(To, UTILS_ConvertChatString(Message)));
	return true;
}

/******************************
 * FUNCTIONS - TOP MENU
 ******************************/

/**
* Get Room list from server and show in pop down in top menu
*
* @param 	OffsetLeft is the position where room menu will be show
* @return 	void
* @author 	Rubens
*/

function ROOM_ShowRoomList(OffsetLeft)
{
	var XML = MESSAGE_RoomList();

	// Ask room list for jabber
	CONNECTION_SendJabber(XML);

	// Show menu on interface
	INTERFACE_ShowRoomMenu(OffsetLeft);
}

/**
* Get Game Room list from server and show in pop down top menu
*
* @param 	offsetleft is the position where room menu will be show
* @return 	void
* @author 	ulysses
*/
function ROOM_ShowGameRoomList(OffsetLeft)
{
	var XML = MESSAGE_GameRoomList();

	// Ask room list for jabber
	CONNECTION_SendJabber(XML);

	// Show menu on interface
	INTERFACE_ShowGameRoomMenu(OffsetLeft)
}


/**
* Send presence to a room (enter room)
*
* @param 	Room name is the name of room
* @return 	string ""
* @author 	Ulysses and Danilo
*/
function ROOM_EnterRoom(RoomName)
{
	var XML, To;

	var Room;

	// Send Message to general room - must be change to Focus Room
	Room = MainData.GetRoom(RoomName);

	if (Room != null)
	{
		ROOM_FocusRoom(RoomName);
	}
	else
	{
		To = RoomName+"@conference."+MainData.GetHost()+"/"+MainData.Username;

		XML = MESSAGE_Presence(To);

		CONNECTION_SendJabber(XML);
	}

	return "";
}

/**
* Exit a room.
* @param 	ReturnMsg is a flag to return XML or send Jabber(if ReturnMsg is null)
* @return	XMPP with presence unavailable to a room
* @author	Pedro and Rubens
*/
function ROOM_ExitRoom(RoomName)
{
	// This function send a message to leave from room;
	// ROOM_RemoveRoom function remove room from data struct and interface,
	// and ROOM_RemoveRoom function is called when parse presence
	// type = unavailable

	var XML;
	var Room = MainData.GetRoom(RoomName)
	var CurrentGame = MainData.GetCurrentGame();
	
	// If RoomName isn't in sctructure
	if (Room == null)
	{
		return "";
	}

	// if user is playing, show a message and don't close room
	if(CurrentGame != null)
	{
		if(RoomName == CurrentGame.Id)
		{
			if(CurrentGame.Finished == false)
			{
				WINDOW_Alert(UTILS_GetText("game_remove_game_title"), UTILS_GetText("game_remove_game"));
				return "";
			}
		}
	}

	XML = MESSAGE_Unavailable(Room.MsgTo);
	CONNECTION_SendJabber(XML);
	
	return XML;
}

/**
* Send presence to a room game(enter room game)
*/
function ROOM_EnterRoomGame(RoomName)
{
	var XML, To;

	To = RoomName+"@"+MainData.GetServer()+"."+MainData.GetHost()+"/"+MainData.Username;

	XML = MESSAGE_Presence(To);

	CONNECTION_SendJabber(XML);

	return true;
}



function ROOM_ShowMessage(RoomName, From, Message, Stamp)
{
	var Room = MainData.GetRoom(RoomName);

	if(Room == null)
	{
		return "";
	}
	
	Room.Room.addMsg(From, Message, Stamp);

	return "";
}

function ROOM_ErrorMessageLength(RoomName)
{
	var Room = MainData.GetRoom(RoomName);
	var Message;
	var Limit = MainData.GetMaxRoomChar();

	if(Room == null)
	{
		return "";
	}
	
	Message = UTILS_GetText("room_error_message_length");
	Message = Message.replace("%s",Limit);
	Room.Room.addMsgError(Message);

	return "";

}

/** 
* Insert user in room list 
*/ 
function ROOM_AddUser(RoomName, Jid, Status, Role, Affiliation) 
{ 
	var Type = "user", Rating; 
	var UserObj = MainData.GetUser(Jid);
	var Buffer = "";
	var Room;

	/*
	if(UserObj == null)
	{
		return null;
	}
	*/

	Room = MainData.GetRoom(RoomName);
	if(Room == null)
	{
		return null;
	}

	if(UserObj != null)
	{
		Rating = UserObj.Rating.GetRatingValue(Room.GetRoomCurrentRating());
	}
	else
	{
		Rating = "";
	}

	// Check if user has already inserted. 
	// If not inserted, add user, else update information
	if(Room.FindUser(Jid) == null)
	{

		// Get user rating and type information
		//Buffer += MESSAGE_Info(Jid); 

		//Add user in data struct
		Room.AddUser(Jid, Status, Type, Role, Affiliation); 
		Room.SortUserListNick(); 
	
		//Add user in interface
		Room.Room.userList.addUser(Jid, Status, Rating, Type); 
	} 
	else
	{
		//Update user information in data struct
		Room.SetUserInformation(Jid, Status, Role, Affiliation) 
		//Update user information in interface
		Room.Room.userList.updateUser(Jid, Status); 
	} 
	return Buffer; 
}

function ROOM_RemoveUser(RoomName, UserName)
{
	var Room = MainData.GetRoom(RoomName);
	
	Room.RemoveUser(UserName)
	
	// Remove user from interface
	Room.Room.userList.removeUser(UserName);

	return "";
}

function ROOM_CreateRoom(RoomName)
{
	var Room;

	// Create a room object
	Room = new RoomObj(RoomName);

	// Add a room in data struct
	MainData.AddRoom(RoomName, null, null, null, Room);

	// Show new room in interface
	INTERFACE_CreateRoomInBar(RoomName);
	// Set focus and current room
	ROOM_FocusRoom(RoomName);
}

function ROOM_FocusRoom(RoomName)
{
	var Room = MainData.GetRoom(RoomName);
	var CurrentRoom = MainData.GetCurrentRoom();

	if((Room != CurrentRoom)&&(CurrentRoom != null))
	{
		// Hide current room div;
		CurrentRoom.Room.hide();
	}

	// Show new room and set it to current
	INTERFACE_FocusRoom(RoomName);
	Room.Room.show();
	INTERFACE_RefreshOccupantsNumber(RoomName);
	MainData.SetCurrentRoom(Room);
	Room.Room.focus();
}

function ROOM_RemoveRoom(RoomName)
{
	var Room = MainData.GetRoom(RoomName);
	var NextRoom, NextRoomPos;
	var RoomList = MainData.GetRoomList();

	if(Room == null)
	{
		return "";
	}
	
	//Remove room from interface
	INTERFACE_RemoveRoomFromList(RoomName);
	ROOM_FocusRoom(RoomName);
	INTERFACE_CloseRoom(RoomName);
	Room.Room.hide();

	//Remove from data struct
	MainData.RemoveRoom(RoomName);


	if(RoomList.length > 1)
	{
		//Get next room from data struct
		//RoomList[0] == General Room
		NextRoomPos = RoomList.length - 1;
		NextRoom = RoomList[NextRoomPos];
	
		//Show next room in interface
		INTERFACE_CreateRoomInBar(NextRoom.Name);
		INTERFACE_RefreshOccupantsNumber(NextRoom.Name);
		ROOM_FocusRoom(NextRoom.Name)
	}
	else
	{
		//Set focus to general room
		ROOM_FocusRoom(MainData.GetRoomDefault());
	}

	return RoomName;
}

//Sort all user in all rooms by nick name
// TODO -> Change this function to get room parameter
function ROOM_SortUsersByNick()
{
	var Room, RoomName;
	var i, j;
	var UserName, Status, Rating, Type;
	var User;
	var RoomList = MainData.GetRoomList();

	// Get all rooms
	for(j=0; j<RoomList.length; j++)
	{
		Room = RoomList[j];
		if(Room == null)
		{
			return false;
		}
		
		// Test the current order mode (order == sort)
		// If ordered into ascending order, change to descending order
		// other modes, change to ascending order
		Room.SetOrderBy((Room.GetOrderBy() + 1) % 2);

		RoomName = Room.Name;

		// Sort user list by nick name in data struct
		Room.SortUserListNick();

		// Show new user list sorted
		for(i=0; i<Room.UserList.length; i++)
		{
			User = Room.UserList[i];

			UserName = User.Username;
			Status = User.Status;
			Type = User.Type;
			Rating = User.Rating.GetRatingValue(Room.GetRoomCurrentRating());
/*
			// Get rating
			switch(Room.GetRoomCurrentRating())
			{
				case "blitz":
					Rating = Room.UserList[i].Rating.Blitz;
					break;
				case "lightning":
					Rating = Room.UserList[i].Rating.Lightning;
					break;
				case "standard":
					Rating = Room.UserList[i].Rating.Standard;
					break;
				case "untimed":
					Rating = Room.UserList[i].Rating.Untimed;
					break;
			}
*/
			Room.Room.userList.removeUser(UserName);
			Room.Room.userList.addUser(UserName, Status, Rating, Type);
		}
		// TODO - Fix user menu position in FF3
		// Proposital hide
		if (MainData.GetBrowser() == 2)
		{
			Room.Room.hideUserList();
		}
	}

	return true;
}

//Sort all user in all rooms by rating name
function ROOM_SortUsersByRating(Category)
{
	var Room, RoomName;
	var i, j;
	var UserName, Status, Rating, Type;
	var User;

	var RoomList = MainData.GetRoomList();


	// Get all rooms
	for(i=0; i<RoomList.length; i++)
	{
		Room = RoomList[i];

		if(Room == null)
		{
			return false;
		}
		
		// If ordered into ascending order, change to descending order
		Room.SetOrderBy((Room.GetOrderBy() + 1) % 2);
		
		Room.SetRoomCurrentRating(Category);

		RoomName = Room.Name;
		// Sort user list by nick name in data struct
		Room.SortUserListRating();

		// Show new user list sorted
		for(j=0; j<Room.UserList.length; j++)
		{
			User = Room.UserList[j]
			UserName = User.Username;
			Status = User.Status;
			Type = User.Type;
			Rating = User.Rating.GetRatingValue(Room.GetRoomCurrentRating());
/*
			// Get rating
			switch(Room.GetRoomCurrentRating())
			{
				case "blitz":
					Rating = User.Rating.Blitz;
					break;
				case "lightning":
					Rating = User.Rating.Lightning;
					break;
				case "standard":
					Rating = User.Rating.Standard;
					break;
				case "untimed":
					Rating = User.Rating.Untimed;
					break;
			}
*/

			Room.Room.userList.removeUser(UserName);
			Room.Room.userList.addUser(UserName, Status, Rating, Type);
		}
		// TODO - Fix user menu position in FF3
		// Proposital hide
		if (MainData.GetBrowser() == 2)
		{
			Room.Room.hideUserList();
		}
	}

	return true;
}

function ROOM_ShowHideUserList(RoomName)
{
	var Room = MainData.GetRoom(RoomName);

	if(Room == null)
	{
		return false;
	}

	if(Room.Room.userListVisibility == false)
	{
		Room.Room.showUserList();
	}
	else
	{
		Room.Room.hideUserList();
	}
	return true;
}
