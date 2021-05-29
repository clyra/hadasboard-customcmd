# hadasboard-customcmd

This is a script to remote control your hadasboard.

## Install

If you are using appdaemon >= 4.0.8 just copy custom_commands.js to the custom_javascript folder! 
For older versions of appdaemon, you will have to include the script by editing the variables.yaml 
file of the skin you use.

## How to use

Hadasboard-customcmd works by sending a "event" named "ad_customcmd" to your dashboard. You can choose
which dashboard to control by using the "deviceid" or "dashid" parameters (consult appdaemon docs for more details).

The following commands are implemented:

### background

Change the wallpaper/background of your dashboard. This will work regardless of the background defined by the skin used.
The script will try to resize the image to fit the dashboard. You can also apply a "css" filter to improve the visibility
of the dashboard buttons by graying or dimming the background image.

Option|Description|
|---|---|
|`url`| The image source to use.  If you use "default" the image will be removed.|
|`filter`| A css filter. Usually something like "grayscale(0.5) brightness(0.5)". Use "default" to remove the filter|

Example:

![background example](/images/background.png)

(this command is heavily based on [MMM-Wallpaper](https://github.com/kolbyjack/MMM-Wallpaper))

### notify

(WIP). Send a notification text to your dashboard.

Option|Description|
|---|---|
|`text`| Text to display. |
|`timeout`| Dismiss the notification after after the configured seconds. (optional)|



