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
* Handle users status
*/


/**
* Change User Status 
*/
function CONTACT_ChangeStatus(NewStatus)
{
	var i, XML= new Array();
		
	// Change user status for contacts
	XML[0] = MESSAGE_ChangeStatus(NewStatus);
	
	// Change user status for rooms
	for (i=0 ; i<MainData.RoomList.length ; i++)
	{
		XML[i+1] = MESSAGE_ChangeStatus(NewStatus, MainData.RoomList[i].Name);
	}
	
	CONNECTION_SendJabber(MESSAGE_MergeMessages(XML));	
}
