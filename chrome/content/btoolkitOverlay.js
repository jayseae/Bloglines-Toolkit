/***
   * Bloglines Toolkit: Utilities for use with Bloglines.
   * An Extension for the Firefox (and Mozilla?) Browser.
   *
   * Release 1.2.0
   * June 17, 2004
   *
   * Copyright 2004, Chad Everett <cxliv.org>
   *
   * This program is free software:  You may redistribute it and/or modify it
   * it under the terms of the Artistic License version 2 as published by the
   * Open Source Initiative.
   *
   * This program is distributed in the hope that it will be useful but does
   * NOT INCLUDE ANY WARRANTY; Without even the implied warranty of FITNESS
   * FOR A PARTICULAR PURPOSE.
   *
   * You should have received a copy of the Artistic License with this program.
   * If not, see <http://www.opensource.org/licenses/artistic-license-2.0.php>.
   **/

// Initiate a new preference instance.
var gPref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

// Create the variables for string values.
var gCitationsURL;
var gMyBlogsURL;
var gPreviewURL;
var gSearchURL;
var gSubscribeURL;

// Create a variable for the stringbundle.
var gText;

// Create a variable for the timer process.
var gTimerID;

// Create a variable for HTTP requests.
var gXMLHttpRequest;

function btoolkitInit()
{
  // Initialize stringbundle.
  gText = document.getElementById('btoolkit-stringbundle');

  // Initialize string values.
  gCitationsURL   = gText.getString('btoolkit_url_citations');
  gMyBlogsURL     = gText.getString('btoolkit_url_myblogs');
  gPreviewURL     = gText.getString('btoolkit_url_preview');
  gSearchURL      = gText.getString('btoolkit_url_search');
  gSubscribeURL   = gText.getString('btoolkit_url_subscribe');

  // Create eventlistener to trigger when context menu is invoked.
  try
  {
    document.getElementById('contentAreaContextMenu').addEventListener('popupshowing',btoolkitContext,false);
  }
  catch(e)
  {
    alert(e);
  }

  // Initial update of notifier icon.
  window.setTimeout(btoolkitUpdateGet,1000);
}

function btoolkitContext()
{
  var bPref;

  // Find context menu display preference.
  try      { bPref = gPref.getBoolPref('btoolkit.context.active'); }
  catch(e) { }

  // Set hidden property of context menu and separators.
  document.getElementById('btoolkit-context-menu').hidden = !(bPref);
  document.getElementById('btoolkit-context-sep-a').hidden = !(bPref);
  document.getElementById('btoolkit-context-sep-a').hidden = !(bPref);

  // If not displaying context menu, return.
  if (!bPref) return;

  // Separator A (top) display preference.
  try      { bPref = gPref.getBoolPref('btoolkit.context.sep.a'); }
  catch(e) { bPref = false }
  document.getElementById('btoolkit-context-sep-a').hidden = !(bPref);

  // Separator B (bottom) display preference.
  try      { bPref = gPref.getBoolPref('btoolkit.context.sep.b'); }
  catch(e) { bPref = false }
  document.getElementById('btoolkit-context-sep-b').hidden = !(bPref);

  // Should link items be hidden or shown?
  document.getElementById('btoolkit-context-search-link').hidden = !(gContextMenu.onLink);
  document.getElementById('btoolkit-context-subscribe-link').hidden = !(gContextMenu.onLink);

  // Should text search item be hidden or shown?
  document.getElementById('btoolkit-context-search-text').hidden = !(gContextMenu.isTextSelected);
  document.getElementById('btoolkit-context-search-text').setAttribute("label",gText.getFormattedString('btoolkit_context_search_text_label',[gContextMenu.searchSelected()]));
}

function btoolkitOpenLink(url)
{
  var iPref;

  // Find link preference.
  try      { iPref = gPref.getIntPref('btoolkit.link.option'); }
  catch(e) { }

  if (!iPref)
  {
    // Current Window
    getBrowser().loadURI(url);
  }
  else if (iPref == 1)
  {
    // New Window
    window.open(url);
  }
  else if (iPref == 2)
  {
    // New Tab
    var bPref;

    // Find context menu display preference.
    try      { bPref = gPref.getBoolPref('btoolkit.link.background'); }
    catch(e) { }

    if (bPref)
    {
      // New Tab in Background
      getBrowser().addTab(url);
    }
    else
    {
      // New Tab in Foreground
      getBrowser().selectedTab = getBrowser().addTab(url);
    }
  }
}

function btoolkitProcessClick(event)
{
  // Right-click event.
  if (event.button == 2)
  {
    window.openDialog('chrome://btoolkit/content/btoolkitPrefs.xul','PrefWindow','chrome,modal=yes,resizable=no','browser');
    return;
  }

  // Left-click event (also single click, like Mac).
  if (event.button == 0)
  {
    // Ctrl-click for Mac properties.  Works on PC too.
    if (event.ctrlKey)
    {
      window.openDialog('chrome://btoolkit/content/btoolkitPrefs.xul','PrefWindow','chrome,modal=yes,resizable=no','browser');
    }
    else
    {
      var stat = document.getElementById('btoolkit-notifier-status').getAttribute('status');

      if (stat == '000')       // None unread.  Refresh.
      {
        btoolkitUpdateGet();
        return;
      }
      if (stat == '00f')       // Disabled.  Show blogs.
      {
        btoolkitReadItems();
        return;
      }
      if (stat == '0f0')       // Unread.  Display them.
      {
        btoolkitReadItems();
        return;
      }
      if (stat == 'f00')       // Problems.  Show prefs.
      {
        window.openDialog('chrome://btoolkit/content/btoolkitPrefs.xul','PrefWindow','chrome,modal=yes,resizable=no','browser');
        return;
      }
    }
  }
}

function btoolkitReadItems()
{
  var bPref;

  // See if we should pause notifier.
  try      { bPref = gPref.getBoolPref('btoolkit.notifier.pause.active'); }
  catch(e) { }

  if (bPref)
  {
    var iPref;

    // Cancel previously submitted notifier job.
    window.clearTimeout(gTimerID);

    // Load the notifier pause timer.
    try      { iPref = gPref.getIntPref('btoolkit.notifier.pause'); }
    catch(e) { iPref = 180; }

    // Re-submit with the appropriate poll timer.
    gTimerID = window.setTimeout(btoolkitUpdateGet,iPref * 1000);

    // Set the icon status.
    document.getElementById('btoolkit-notifier-status').setAttribute("status","000");
    document.getElementById('btoolkit-notifier-status').setAttribute("tooltiptext",gText.getString('btoolkit_msg_notifier_nounread'));
  }

  // Open up my blogs display.
  btoolkitOpenLink(gMyBlogsURL);
}

function btoolkitUpdateGet()
{
  var icon = document.getElementById('btoolkit-notifier-status');
  var iPref, bPref;

  // Cancel previously submitted notifier job.
  window.clearTimeout(gTimerID);

  // Load the notifier poll timer.
  try      { iPref = gPref.getIntPref('btoolkit.notifier.timer'); }
  catch(e) { iPref = 180; }

  // Re-submit with the appropriate poll timer.
  gTimerID = window.setTimeout(btoolkitUpdateGet,iPref * 1000);

  // Find notifier update preference.
  try      { bPref = gPref.getBoolPref('btoolkit.notifier.active'); }
  catch(e) { }

  if (!bPref)
  {
    icon.setAttribute("status","00f");
    icon.setAttribute("tooltiptext",gText.getString('btoolkit_msg_notifier_disabled'));
    return;
  }
  else
  {
    icon.setAttribute("tooltiptext",gText.getString('btoolkit_msg_notifier_fetching'));
  }

  var cPref;

  // Load the notifier email address.
  try
  {
    cPref = gPref.getCharPref('btoolkit.notifier.email');
  }
  catch(e)
  {
    icon.setAttribute("status","f00");
    icon.setAttribute("tooltiptext",gText.getString('btoolkit_msg_notifier_noemail'));
    return;
  }

  gXMLHttpRequest = new XMLHttpRequest();
  gXMLHttpRequest.onload = btoolkitUpdateSet;
  gXMLHttpRequest.open('GET','http://rpc.bloglines.com/update?user=' + cPref + '&amp;ver=1');
  gXMLHttpRequest.setRequestHeader('User-Agent','BloglinesNotifier/Bloglines Toolkit for Mozilla/1.2.0');
  gXMLHttpRequest.send(null);
}

function btoolkitUpdateSet()
{
  var icon = document.getElementById('btoolkit-notifier-status');
  gXMLHttpRequest.responseText.match(/^\|([^\|]*)\|/);

  switch(RegExp.$1)
  {
    case '0':
      icon.setAttribute("status","000");
      icon.setAttribute("tooltiptext",gText.getString('btoolkit_msg_notifier_nounread'));
      break;
    case '-1':
      icon.setAttribute("status","f00");
      icon.setAttribute("tooltiptext",gText.getString('btoolkit_msg_notifier_bademail'));
      break;
    default:
      icon.setAttribute("status","0f0");
      icon.setAttribute("tooltiptext",gText.getFormattedString('btoolkit_msg_notifier_unread',[RegExp.$1]));
      break;
  }
}

// Create event listener.
window.addEventListener('load',btoolkitInit,false); 
