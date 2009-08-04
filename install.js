const APP_DISPLAY_NAME   = "Bloglines Toolkit";
const APP_NAME           = "btoolkit";
const APP_PACKAGE        = "/jayseae/btoolkit";
const APP_VERSION        = "0.9.0";

const APP_JAR_FILE       = "btoolkit.jar";
const APP_CONTENT_FOLDER = "content/";
const APP_LOCALE_FOLDER  = "locale/en-US/";

var chromeFolder, chromeFlag;

initInstall(APP_NAME, APP_PACKAGE, APP_VERSION);

if (confirm("Install this into the application directory?  (Cancel will install into your profile directory)"))
{
  chromeFolder = getFolder("Chrome");
  chromeFlag = DELAYED_CHROME;
}
else
{
  chromeFolder = getFolder("Profile", "chrome");
  chromeFlag = PROFILE_CHROME;
}

var err = addFile(APP_PACKAGE, APP_VERSION, APP_JAR_FILE, chromeFolder, null)

if (err == SUCCESS)
{ 
  var jar = getFolder(chromeFolder, APP_JAR_FILE);
  registerChrome(CONTENT | chromeFlag, jar, APP_CONTENT_FOLDER);
  registerChrome(LOCALE | chromeFlag, jar, APP_LOCALE_FOLDER);
	
  err = performInstall();

  if (err != 0 && err != 999)
  {
    alert("Install failed. Error code:" + err);
    cancelInstall(err);
  }
}
else
{ 
  alert("Failed to create " + APP_JAR_FILE + "\n"
    +"You probably don't have appropriate permissions \n"
    +"(write access to mozilla/chrome directory). \n"
    +"_____________________________\nError code:" + err);
  cancelInstall(err);
}
