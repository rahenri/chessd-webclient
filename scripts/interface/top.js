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
* Create element of top of the screen
*/

function INTERFACE_CreateTop()
{
	var MainDiv, Logo, MenuDiv, IconsList, MenuList, Item, ItemTitle;

	MainDiv = UTILS_CreateElement("div", "Top");
	Logo = UTILS_CreateElement("h1", null, null, UTILS_GetText("general_name"));
	MenuDiv = UTILS_CreateElement("div", "TopMenu");
	IconsList = UTILS_CreateElement("ul", null, "icons");
	MenuList = UTILS_CreateElement("ul", null, "menu");

	// Append icons to list
	// Search game
	ItemTitle = UTILS_GetText("menu_search_game")
	Item = UTILS_CreateElement("li", null, "search_game", ItemTitle);
	Item.title = ItemTitle;
	IconsList.appendChild(Item);
	
	// Search user
	ItemTitle = UTILS_GetText("menu_search_user")
	Item = UTILS_CreateElement("li", null, "search_user", ItemTitle);
	Item.title = ItemTitle;
	IconsList.appendChild(Item);

	// News
	ItemTitle = UTILS_GetText("menu_news")
	Item = UTILS_CreateElement("li", null, "news", ItemTitle);
	Item.title = ItemTitle;
	IconsList.appendChild(Item);

	// Preferences
	ItemTitle = UTILS_GetText("menu_preferences")
	Item = UTILS_CreateElement("li", null, "preferences", ItemTitle);
	Item.title = ItemTitle;
	IconsList.appendChild(Item);

	// Help
	ItemTitle = UTILS_GetText("menu_help")
	Item = UTILS_CreateElement("li", null, "help", ItemTitle);
	Item.title = ItemTitle;
	IconsList.appendChild(Item);

	// Exit
	ItemTitle = UTILS_GetText("menu_exit");
	Item = UTILS_CreateElement("li", null, "exit", ItemTitle);
	Item.onclick = function () { 
		LOGIN_Logout();
	}
	Item.title = ItemTitle;
	IconsList.appendChild(Item);

	// Appending itens to menu
	// Current games
	Item = UTILS_CreateElement("li", null, null, UTILS_GetText("menu_current_games"));
	MenuList.appendChild(Item);
	
	// Challenges
	Item = UTILS_CreateElement("li", null, null, UTILS_GetText("menu_challenges"));
	MenuList.appendChild(Item);
	
	// Tourneys
	Item = UTILS_CreateElement("li", null, null, UTILS_GetText("menu_tourneys"));
	MenuList.appendChild(Item);
	
	// Rooms
	Item = UTILS_CreateElement("li", null, null, UTILS_GetText("menu_rooms"));
	MenuList.appendChild(Item);
	
	// History
	Item = UTILS_CreateElement("li", null, null, UTILS_GetText("menu_history"));
	MenuList.appendChild(Item);

	MenuDiv.appendChild(IconsList);
	MenuDiv.appendChild(MenuList);
	MainDiv.appendChild(Logo);
	MainDiv.appendChild(MenuDiv);

	return MainDiv;
}
