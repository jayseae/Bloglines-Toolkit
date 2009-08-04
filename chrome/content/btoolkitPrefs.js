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

// Declare form variables.
var _elementIDs = [
  'btoolkit.context.active',
  'btoolkit.context.sep.a',
  'btoolkit.context.sep.b',
  'btoolkit.context.sep.b',
  'btoolkit.link.background',
  'btoolkit.link.option',
  'btoolkit.notifier.active',
  'btoolkit.notifier.email',
  'btoolkit.notifier.pause',
  'btoolkit.notifier.pause.active',
  'btoolkit.notifier.timer'
];

function btoolkitPrefsFlip()
{
  var bPref, xPref;

  bPref = document.getElementById('btoolkit.context.active').checked;
  document.getElementById('btoolkit.context.sep.a').disabled = !(bPref);
  document.getElementById('btoolkit.context.sep.b').disabled = !(bPref);

  bPref = parseInt(document.getElementById('btoolkit.link.option').value) == 2;
  document.getElementById('btoolkit.link.background').disabled = !(bPref);

  bPref = document.getElementById('btoolkit.notifier.active').checked;
  document.getElementById('btoolkit.notifier.email').disabled = !(bPref);
  document.getElementById('btoolkit.notifier.email.label').disabled = !(bPref);
  document.getElementById('btoolkit.notifier.pause').disabled = !(bPref);
  document.getElementById('btoolkit.notifier.pause.active').disabled = !(bPref);
  document.getElementById('btoolkit.notifier.pause.label').disabled = !(bPref);
  document.getElementById('btoolkit.notifier.timer').disabled = !(bPref);
  document.getElementById('btoolkit.notifier.timer.label').disabled = !(bPref);

  xPref = document.getElementById('btoolkit.notifier.pause.active').checked;
  document.getElementById('btoolkit.notifier.pause').disabled = !(bPref && xPref);
}

function btoolkitPrefsInit()
{
  for( var i = 0; i < _elementIDs.length; i++ )
  {
    var elementID = _elementIDs[i];
    var element = document.getElementById(elementID);

    if (!element)
    {
      break;
    }
    else if (element.localName == 'checkbox')
    {
      try { element.checked = gPref.getBoolPref(elementID); }
      catch(e) { element.checked = false; }
    }
    else if (element.localName == 'radiogroup')
    {
      try { element.selectedItem = element.childNodes[gPref.getIntPref(elementID)]; }
      catch(e) { element.selectedItem = element.childNodes[0]; }
    }
    else if (element.localName == 'textbox')
    {
      if (element.getAttribute('preftype') == 'int')
      {
        try { element.value = gPref.getIntPref(elementID); }
        catch(e) { element.value = 180; }
      }
      else
      {
        try { element.value = gPref.getCharPref(elementID); }
        catch(e) { element.value = ''; }
      }
    }
  }

  btoolkitPrefsFlip();
}

function btoolkitPrefsSave()
{
  for( var i = 0; i < _elementIDs.length; i++ )
  {
    var elementID = _elementIDs[i];
    var element = document.getElementById(elementID);

    if (!element)
    {
      break;
    }
    else if (element.localName == 'checkbox')
    {
      gPref.setBoolPref(elementID, element.checked);
    }
    else if (element.localName == 'radiogroup')
    {
      gPref.setIntPref(elementID, parseInt(element.value));
    }
    else if (element.localName == 'textbox')
    {
      if (element.getAttribute('preftype') == 'int')
      {
        var bOkay = true;
        var cPref = '';
        var sPref = element.value.replace(/^[0]*/);
        var sWork = "0123456789";

        for (j = 0; j < sPref.length; j++)
        {
          if (sWork.indexOf(sPref.charAt(j)) == -1) bOkay = false;
          else cPref = cPref + sPref.charAt(j);
        }

        if (cPref.length == 0 ) cPref = '0';
        var iPref = parseInt(cPref);
        if (iPref < 180) iPref = 180;
        gPref.setIntPref(elementID, iPref);
      }
      else
      {
        gPref.setCharPref(elementID, element.value);
      }
    }
  }

  btoolkitPrefsFlip();
}
