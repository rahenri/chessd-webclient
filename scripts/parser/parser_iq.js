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

/*
* @file		parser/parser_iq.js
* @brief	Parser Iq messages received from jabber
*/

/**
* @brief	Parse Iq's received from jabber
*
* @param	XML	XMPP with Iq message
* @return 	XMPP message to send
* @author	Ulysses Bomfim
*/
function PARSER_ParseIq(XML)
{
	//XML = iq tag
	var Type = XML.getAttribute("type");
	var ID = XML.getAttribute("id");
	var FirstNode = XML.firstChild;
	var Buffer = "";
	var Xmlns = "";

	var Consts = MainData.GetConst();

	if(FirstNode != undefined)
	{
		Xmlns = FirstNode.getAttribute("xmlns");
	}
	else
	{	
		// This case should happen when user receive result from server.
		// Some messages come without iq child node in chess server
		// protocol.
		return "";
	}

	switch (Type)
	{
		case "result":
			// Receive user list
			if (Xmlns.match(/jabber:iq:roster/))
			{
				Buffer += USER_HandleContactUserList(XML);
				Buffer += CONTACT_HandleContactUserList(XML);
			}

			// Receive room list
			else if (Xmlns.match(/disco#items/))
			{
				Buffer += ROOM_HandleRoomList(XML);
				Buffer += CURRENTGAME_HandleGameRoomList(XML);
			}

			// Receive room info -> used to running games
			else if (Xmlns.match(/disco#info/))
			{
				Buffer += CURRENTGAME_HandleGameRoomInfoList(XML);
			}

			// Receive information of user list
			/*
			else if (Xmlns.match(/\/chessd#info/))
			{
				Buffer += ADMIN_HandleInfo(XML);
				// contact/info.js
				Buffer += ROOM_HandleInfo(XML);
			}
			*/
			// Receive profile information of user
			else if (Xmlns.match(/\/chessd#profile/))
			{
				Buffer += USER_HandleInfo(XML);
				Buffer += ADMIN_HandleInfo(XML);
				// contact/info.js
				Buffer += ROOM_HandleInfo(XML);
				Buffer += CONTACT_HandleInfo(XML);
				Buffer += ONLINE_HandleInfo(XML);
				Buffer += PROFILE_HandleInfoProfile(XML);
			}
			else if (Xmlns.match(/\/chessd#match_announcement/))
			{
				Buffer += ANNOUNCE_HandleAnnounce(XML);
			}
			// Challenge accept confirmation
			else if (Xmlns.match(/\/chessd#match/))
			{
				Buffer += CHALLENGE_HandleChallenge(XML);
			}
			// Search user request
			else if (Xmlns.match(/jabber:iq:search/))
			{
				Buffer += CONTACT_HandleSearchUser(XML);
			}
			// Search Old Game
			else if (Xmlns.match(/\/chessd#search_game/))
			{
				Buffer += OLDGAME_HandleSearchOldGame(XML);
			}
			else if (Xmlns.match(/\/chessd#fetch_game/))
			{
				Buffer += OLDGAME_FetchOldGame(XML);
			}
			else if (Xmlns.match(/\/chessd#adjourned#list/))
			{
				Buffer += CHALLENGE_HandleAdjourn(XML);
			}
			// Game messages
			else if (Xmlns.match(/\/chessd#game/))
			{
				Buffer += GAME_HandleGameResult(XML);
			}
			else if (Xmlns.match(/vcard-temp/))
			{
				if (ID == Consts.IQ_ID_GamePhoto)
				{
					Buffer += GAME_HandleVCardPhoto(XML);
				}
				else if (ID == Consts.IQ_ID_OldGamePhoto)				{
					Buffer += OLDGAME_HandleVCardPhoto(XML);
				}
				else
				{
					Buffer += PROFILE_HandleVCardProfile(XML);
				}
			}
			else if (Xmlns.match(/\/chessd#admin/))
			{
				Buffer += ADMIN_HandleAdmin(XML);
			}
			else if (Xmlns == "")
			{
				Buffer += PARSER_ParseIqById(XML);
			}
			break;

		case "set":
			if (Xmlns.match(/\/chessd#match_announcement/))
			{
				Buffer += ANNOUNCE_HandleAnnounceGame(XML);
			}
			// Challenge messages
			else if (Xmlns.match(/\/chessd#match/))
			{
				// Quick fix to avoid error when login in
				// enviroment and has a pendent challenge;
				try
				{
					Buffer += CHALLENGE_HandleChallenge(XML);
				}
				catch(e)
				{
				}

			}

			// Game messages
			else if (Xmlns.match(/\/chessd#game/))
			{
				Buffer += GAME_HandleGame(XML);
			}

			// Admin messages
			else if (Xmlns.match(/\/muc#admin/))
			{
				Buffer += ADMIN_HandleRoomAdmin(XML);
			}

			// Admin notification
			else if (Xmlns.match(/\/chessd#admin/))
			{
				Buffer += ADMIN_HandleUserNotification(XML);
			}

			// Search user request
			else if (Xmlns.match(/jabber:iq:roster/))
			{
				Buffer += CONTACT_HandleSetSubscribe(XML);
			}
			break;

		case "error": 
			if (Xmlns.match(/\/chessd#match_announcement/))
			{
				Buffer += ANNOUNCE_HandleAnnounceError(XML);
			}
			// Challenge messages
			else if (Xmlns.match(/\/chessd#match/))
			{
				Buffer += CHALLENGE_HandleErrorChallenge(XML);
			}
			// Game messages
			else if (Xmlns.match(/\/chessd#game/))
			{
				Buffer += GAME_HandleGameError(XML);
			}
			// Receive room info -> used to running games
			else if (Xmlns.match(/disco#info/))
			{
				Buffer += CURRENTGAME_HandleGameRoomInfoError(XML);
			}
				else if (Xmlns.match(/\/chessd#admin/))
			{
				Buffer += ADMIN_HandleAdminError(XML);
			}


			break;
		    
		default: break;
	}

	return Buffer;
}

/**
* @brief	Parse Iq's messages by Iq id
*
* @param	XML	XMPP messages with Iq tag
* @return 	XMPP message to send
* @author	Rubens Suguimoto
*/
function PARSER_ParseIqById(XML)
{
	var Type = XML.getAttribute("type");
	var ID = XML.getAttribute("id");
	var Buffer = "";

	var Consts = MainData.GetConst();

	// Received an empty vcard. Need to create a basic profile
	if (ID == Consts.IQ_ID_GetMyProfile)
	{
		Buffer += PROFILE_CreateProfile();
	}
	return Buffer;
}
