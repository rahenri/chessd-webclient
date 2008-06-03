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
* Control user information (rating an type)
*/

/**
* Receive a info message and set it in user list
*/
function CONTACT_HandleInfo(XML)
{
	var RatingNodes, TypeNodes;
	var Jid, Profile, Type, Rating;
	
	RatingNodes = XML.getElementsByTagName('rating');
	TypeNodes = XML.getElementsByTagName('type');

	// Profile window opened
	if (MainData.ProfileList.length > 0)
	{
		// Only one user
		if (TypeNodes.length == 1)
		{
			Jid = TypeNodes[0].getAttribute('jid');

			Type = TypeNodes[0].getAttribute('type');
			
			// Profile Update
			Profile = MainData.GetProfile(Jid);
			if (Profile)
			{
				Profile.Profile.SetGroup(Type);
				
				Rating = PROFILE_HandleRatings(RatingNodes);

				Profile.Profile.SetRatings(Rating);
			}
		}
	}

	// Update contacts 
	CONTACT_HandleRating(RatingNodes);
	CONTACT_HandleType(TypeNodes);

	return "";
}

/**
* Handle user rating, update the structure and interface
*/
function CONTACT_HandleRating(NodeList)
{
	var Username, Rating, Category, i;

	// Getting ratings
	for (i=0 ; i<NodeList.length ; i++)
	{
		// Try to get the user name, rating and category of rating
		try 
		{
			Username = NodeList[i].getAttribute('jid').replace(/@.*/,"");
			Category = NodeList[i].getAttribute('category');
			Rating = NodeList[i].getAttribute('rating');
		}
		catch (e)
		{
			continue;
		}
		
		// Set rating on structure
		CONTACT_SetUserRating(Username, Category, Rating);
	}
}

/**
* Handle user types, update the structure and interface
*/
function CONTACT_HandleType(NodeList)
{
	var Jid, Type, i;

	// Getting user type
	for (i=0 ; i<NodeList.length ; i++)
	{
		// Try to get jid and type
		try 
		{
			Jid = NodeList[i].getAttribute('jid').replace(/@.*/,"");
			Type = NodeList[i].getAttribute('type');
		}
		catch (e)
		{
			continue;
		}

		// Set type on sctructure
		if (Type != "user")
		{
			CONTACT_SetUserType(Jid, Type);
		}
	}
}

/**
* Change type of 'Username' in structure and interface
*/
function CONTACT_SetUserType(Username, NewType)
{
	var i;
	var Room;
	var Status, Rating;
	var User;
	

	// update on interface
	if(MainData.SetType(Username, NewType))
	{
		// RoomList[0] = general room where is all user online
		if(MainData.RoomList[0] == null)
		{
			return "";
		}		
		User = MainData.FindUserInRoom(MainData.RoomList[0].Name,Username);
		if(User != null)
		{
			Room = MainData.RoomList[0]; 
			Status = Room.UserList[User].Status;

			MainData.ContactOnline.userList.updateUser(Username,Status, null, NewType);
		}

		// Update in rooms
		// Updating in room lists
		for (i=0; i<MainData.RoomList.length; i++)
		{
			User = MainData.FindUserInRoom(MainData.RoomList[i].Name, Username);
			if (User != null)
			{
				Room = MainData.RoomList[i];
				Status = Room.UserList[User].Status;

				// Search user node in room user list
				Room.Room.userList.updateUser(Username, Status, null, NewType);
			}
		}

	}
	return true;
}

/**
* Change rating of 'Username' in structure and interface
*/
function CONTACT_SetUserRating(Username, Category, Rating)
{
	var i;
	var Room;
	var Status, Type;
	var User;
	

	// update on interface
	if(MainData.SetRating(Username, Category, Rating))
	{
		if (Category == MainData.CurrentRating)
		{
			if(MainData.RoomList[0] == null)
			{
				return "";
			}		
			User = MainData.FindUserInRoom(MainData.RoomList[0].Name,Username);
			if(User != null)
			{
				// General Room
				Room = MainData.RoomList[0]; 
				Status = Room.UserList[User].Status;
				Type = Room.UserList[User].Type;

				MainData.ContactOnline.userList.updateUser(Username,Status, Rating, Type);
			}
		}

		// Update in rooms
		if (Category == MainData.RoomCurrentRating)
		{

			// Updating in room lists
			for (i=0; i<MainData.RoomList.length; i++)
			{
				User = MainData.FindUserInRoom(MainData.RoomList[i].Name, Username);
				if (User != null)
				{
					Room = MainData.RoomList[i];
					Status = Room.UserList[User].Status;
					Type = Room.UserList[User].Type;
					// Search user node in room user list
					Room.Room.userList.updateUser(Username, Status, Rating, Type);
				}
			}
		}

	}
	return false;
}
