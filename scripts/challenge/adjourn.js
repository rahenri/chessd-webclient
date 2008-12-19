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
 * @file 	adjourn.js
 * @brief	Functions to parse adjourned games message and show result
 * 		in interface
 *
 * See interface challenge menu (scripts/interface/challengemenu.js) and data
 * methods to adjourn/postpone game list (scripts/data/data.js)
 *
 * PS: Currently, adjourn and postpone games are considered the same thing.
*/

/**
 * @brief 	Parse XML with adjourned games list and show in challenge menu
 *
 * @param	XML	XML with adjourned games
 * @return	Buffer with other XMPP to send
 * @author	Rubens Suguimoto
 */
function CHALLENGE_HandleAdjourn(XML)
{
	var Query = XML.getElementsByTagName("query");
	var Xmlns;
	var Buffer = "";
	
	var AdjournList = XML.getElementsByTagName("game");
	var Game, Players;
	var Player1, Player2;
	var AdjournId, Category, Date;
//	var ChallengeMenu = MainData.GetChallengeMenu();
	var GameCenter = MainData.GetGamecenter();
	var Status;

	var MyUsername = MainData.GetUsername();
	var User;

	var i;
	
	var P1Rating, P2Rating;

	for(i=0; i< AdjournList.length; i++)
	{
		Game = AdjournList[i];

		AdjournId = Game.getAttribute("id");
		Category = Game.getAttribute("category");
		Date = Game.getAttribute("time_stamp").split("T")[0];

		if(MainData.FindPostpone(AdjournId) == null)
		{
			Players = Game.getElementsByTagName("player")

			Player1 = new Object();
			Player2 = new Object();

			Player1.Name = Players[0].getAttribute("jid").split("@")[0];
			Player1.Color= Players[0].getAttribute("role");
			Player1.Time = Players[0].getAttribute("time");
			Player1.Inc  = Players[0].getAttribute("inc");

			Player2.Name = Players[1].getAttribute("jid").split("@")[0];
			Player2.Color= Players[1].getAttribute("role");
			Player2.Time = Players[1].getAttribute("time");
			Player2.Inc  = Players[1].getAttribute("inc");

			P1Rating = MainData.GetUser(Player1.Name).GetRatingList().GetRatingValue(Category);
			P2Rating = MainData.GetUser(Player2.Name).GetRatingList().GetRatingValue(Category);

			if(Player1.Name == MyUsername)
			{
				// Add in main data postpone list
				MainData.AddPostpone(Player2, Category, Date, AdjournId);

				// Add in challenge menu
				//ChallengeMenu.addPostpone(Player2, Category, Date, AdjournId);
				GameCenter.Postpone.add(Player2, Player2.Time, Player2.Inc, Category, P2Rating, Date, AdjournId);

				// Get oponent status
				User = MainData.GetUser(Player2.Name);
				if(User != null)
				{
					Status = User.GetStatus();
				}
				else
				{
					Status = "offline";
				}				

				CHALLENGE_PostponePresence(Player2.Name, Status);
			}
			else
			{
				// Add in main data postpone list
				MainData.AddPostpone(Player1, Category, Date, AdjournId);

				// Add in challenge menu
				//ChallengeMenu.addPostpone(Player1, Category, Date, AdjournId);
				GameCenter.Postpone.add(Player1, Player1.Time, Player1.Inc, Category, P1Rating, Date, AdjournId);

				// Get oponent status
				User = MainData.GetUser(Player1.Name);
				if(User != null)
				{
					Status = User.GetStatus();
				}
				else
				{
					Status = "offline";
				}				
				CHALLENGE_PostponePresence(Player1.Name, Status);
			}
		}
	}

	// Show postpone games
	//ChallengeMenu.showPostpone();

	return Buffer;
}

/**
 * @brief 	Parse presence to adjourn game user;
 *
 * Parse presence to user in challenge list. I.E.: if user comes offline
 * the adjourn game with this user turn unavailable to play.
 *
 * @param	XML	XML with adjourned games
 * @return	Buffer with other XMPP to send
 * @author	Rubens Suguimoto
 */
function CHALLENGE_HandlePresence(XML)
{
	var GeneralRoom = XML.getAttribute("from").split("@")[0];
	var StatusType, Username;
	var Status;
	var Buffer = "";

	Username = XML.getAttribute("from").split("/")[1];
	StatusType = XML.getAttribute("type");

	//FIX -> CHANGE PRESENCE TYPE "offline" TO "unavailable"
	if(StatusType == "unavailable")
	{
		Status = "offline";
	}
	else
	{
		Status = "available";
	}
	
	CHALLENGE_PostponePresence(Username, Status);

	return Buffer;
}



/**
 * @brief	Update status of user in postpone list
 *
 * @param	Username	Name used by user
 * @return	Empty string;
 * @author	Rubens Suguimoto
 */
function CHALLENGE_PostponePresence(Username, PresenceType)
{
//	var ChallengeMenu = MainData.GetChallengeMenu();
	var GameCenter = MainData.GetGamecenter();
	//FIX -> CHANGE PRESENCE TYPE "offline" TO "unavailable"
	//If user is founded, set adjourn game to available, else unavailable
	if(PresenceType == "offline")
	{
//		ChallengeMenu.updatePostpone(Username, "offline");
		GameCenter.Postpone.update(Username, "offline");
	}
	else
	{
//		ChallengeMenu.updatePostpone(Username, "online");
		GameCenter.Postpone.update(Username, "online");
	}
	return "";
}


/**
 * @brief 	Create and send a message to resume a game with some player
 *
 * @param	AdjournId	Adjourned game Id;
 * @return	Empty string;
 * @author	Rubens Suguimoto
 */
function CHALLENGE_SendResumeGame(AdjournId)
{
	var XMPP = "";
	
	var Postpone = MainData.GetPostpone(AdjournId);

	var Challenger = new Object();
	var Challenged = new Object();

	var Category = Postpone.Category;
	var MyUsername = MainData.GetUsername();
	var ChallengeSequence = MainData.GetChallengeSequence();
	var ChallengeId = "offer_adj"+ChallengeSequence;

	// Create challenge in challenge list
	Challenged.Name = Postpone.Challenged.Name;
	Challenged.Color = Postpone.Challenged.Color;
	Challenged.Time = Postpone.Challenged.Time;
	Challenged.Inc = Postpone.Challenged.Inc;

	Challenger.Name = MyUsername;
	Challenger.Color = "undefined";
	Challenger.Time = 0;
	Challenger.Inc = 0;

	// Add challenge in challenge list
	MainData.AddChallenge(ChallengeId, Challenger, Challenged, Category, "false", null);
	MainData.SetChallengeSequence(ChallengeSequence + 1);

	// Create and send message to resume adjourned game
	XMPP += MESSAGE_ChallengeResumeGame(AdjournId, ChallengeId);
	CONNECTION_SendJabber(XMPP);

	// Remove adjourned game from postponed list;
	CHALLENGE_RemovePostpone(AdjournId);

	//TODO -> Remove and don't show again a removed adjourn game with 
	// AdjournId

	return "";
}

/**
 * @brief 	Create and send message to get adjourned games list
 *
 * @return	Empty string;
 * @author	Rubens Suguimoto
 */
function CHALLENGE_GetAdjournGames()
{
	var XMPP;
	var Num = 10; // Get just 10 adjourned games

	XMPP = MESSAGE_ChallengeGetAdjournList(Num,0);

	CONNECTION_SendJabber(XMPP);

	return "";
}

/**
 * @brief	Remove post pone from maindata and challenge menu
 *
 * @param	Id	Adjourned/Postpone game Id
 * @return	Empty string;
 * @author	Rubens Suguimoto
 */

function CHALLENGE_RemovePostpone(Id)
{
//	var ChallengeMenu = MainData.GetChallengeMenu();
	var GameCenter = MainData.GetGamecenter();

	MainData.RemovePostpone(Id);
	//ChallengeMenu.removePostpone(Id);
	GameCenter.Postpone.remove(Id);

	return "";
}
