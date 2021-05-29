
const BG_STORAGE_CK = 'adcustomcmd-bg';
const FT_STORAGE_CK = 'adcustomcmd-ft';

//const CFG_STORAGE_CK = 'adcustomcmd-cfg';
//myDeviceID = getCookie('ADdevID');

window.onload = function () { initCustomCMD(); };

async function waitDashstream() {

    while (typeof window.dashstream === 'undefined')
    {
        await sleep(500); 
    }

    //while (typeof window.dashstream.stream === 'undefined')
    //{
    //    await sleep(200);    
    //}
   
    window.dashstream.stream.listen_event('*', 'ad_customcmd', customCMD );
   
    console.log('dashstream is ready');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initCustomCMD()
{
    waitDashstream();
    restoreBg();
    createModal();
    
    //setCustomCMDListener();
    //customLogDebug();
}


function setCustomCMDListener()
{
    //old way... wait enough time and start to listen. disabled by default
    //we need to wait for dashstream...
    setTimeout( function () {
                   window.dashstream.stream.listen_event('*', 'ad_customcmd2', customCMD );
                   console.log("dastream2 is ready"); },
                5000);
}

function customCMD(msg)
{
    //console.log(msg);
    data = msg.data;

    //check if we should execute this cmd based on deviceid or dashid
    // 3 possible cases: 1) deviceid is set and equal to our deviceid
    // 2) dashid is set and match a substring of our dashboard title
    // 3) neither deviceid or dashid is set
    if ((data.data.command) &&
        ((data.data.deviceid && data.data.deviceid ===  myDeviceID ) ||
        (data.data.dashid && document.title.includes(data.data.dashid)) ||
        (!data.data.deviceid && !data.data.dashid)))
    {
        switch (data.data.command)
        {
            case 'navigate':
                customNavigate(data);
                break;
            case 'background':
                changeBg(data);
                break;
            case 'notify':
                 customNotify(data);
                 break;
            case 'debug':
                 customDebug();
                 break;    
        }    
    }
}

// cookie functions
function customGetCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log('getting cookie:  ' + decodedCookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function customSetCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + "; SameSite=strict; expires=Sat, 1 Jan 2050 12:00:00 UTC;";
}

function customDeleteCookie(cname) {
    document.cookie = cname + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
}

function customDebug() {
        bg = customGetCookie(BG_STORAGE_CK);
        alert("BG cookie:  " + bg 
             + "\n");
}

function customLogDebug() {

        bg = customGetCookie(BG_STORAGE_CK);
        console.log('bg: ' + bg);
        console.log('id: ' + myDeviceID);
}

// WIP
function notifyfx(data) {

    var notification = new NotificationFx({
                            //wrapper: document.body,
                            message : '<p>' + data.data.text + '</p>',
                            layout : 'grow',
                            effect : 'scale',
                            type : 'notice', // notice, warning, error or success
                            ttl: 10000,
                            //onClose: function() { return false;},
                            //onOpen: function() { return false; } 
                            //onClose : function() {
                            //    bttn.disabled = false;
                            //}
                        });

                        // show the notification
                        notification.show();
}

//change background
function changeBg(data)
{
        // if defaul remove cookies and restore background
        if (data.data.url === 'default')
        {
          customDeleteCookie(BG_STORAGE_CK);
          customDeleteCookie(FT_STORAGE_CK);
          window.location.reload();  
        }
        else
        {
          customSetCookie(BG_STORAGE_CK, data.data.url);
          if (data.data.filter){
            customSetCookie(FT_STORAGE_CK, data.data.filter);
            filter = data.data.filter
          } else {
            customDeleteCookie(FT_STORAGE_CK);
            filter = "";
          }
          setBg(data.data.url, filter);
        }      
}

// restore the custom bg on page load
function restoreBg()
{
    var bg = customGetCookie(BG_STORAGE_CK);
    if (bg != '' && bg != undefined && bg != 'default')
    {
        //retrive filter settings, if any
        var filter = customGetCookie(FT_STORAGE_CK);
        setBg(bg, filter);
    }
}

function setBg(bg, filter)
{
    var wrapper = document.getElementById("customBG");
    
    //is there a previous image loadded?
    if (wrapper !== null) {
        
        //yes
        child = document.getElementById('customBG-img');
        //wrapper.removeChild(child);

        var img = document.createElement("img");
        img.id = "customBG-img"
        img.style.opacity = "0";
    
        img.onload = function() {
            img.style = getWallpaperStyle(img);
            img.style.filter = filter;
            img.style.opacity = "1";
            
            //transition to the new image
            setTimeout(() => {
                img.ontransitionend = function() { wrapper.removeChild(child) };
                img.style.transition = "opacity 2s ease-in-out ";
            }, 2);
        };

        img.src = bg;

        wrapper.appendChild(img);
        
    } else {

        //no previous image, so create wrapper
        var wrapper = document.createElement("div");
        wrapper.id = "customBG"
        var img = document.createElement("img");
        img.id = "customBG-img"
        img.style.opacity = "0";
        
        img.onload = function() {
            img.style = getWallpaperStyle(img);
            img.style.filter =  filter;
            img.style.opacity = "1";
        };

        img.src = bg;

        wrapper.appendChild(img);

        window.document.body.insertBefore(wrapper, window.document.body.firstChild);
    }
}

function getWallpaperStyle(image) 
{
    // how we should resize the wallpaper to fit the screen?
    var viewport = getViewport();
    var fitVerticalWidth = image.naturalWidth * viewport.height / image.naturalHeight;

    if (fitVerticalWidth >= viewport.width) {
      //console.log("tall " + fitVerticalWidth);
      return "position: fixed; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); height: 100%;"
    } else {
      //console.log("wide " + fitVerticalWidth);
      return "position: fixed; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 100%;"
    }
}

function getViewport() {
    var w = window;
    var e = document.documentElement;
    var g = document.body;

    return {
      width: w.innerWidth || e.clientWidth || g.clientWidth,
      height: w.innerHeight || e.clientHeight || g.clientHeight
    };
}

// navigate stuff. Really not needed as it's now default to hadashboard. anyway...
function customNavigate(data)
{
    var timeout_params = "";
    if ("timeout" in data.data)
        {
        var timeout = data.data.timeout;
        if (location.search === "")
        {
            timeout_params = "?";
        }
        else
        {
            timeout_params = "&";
        }
        if ("return" in data.data)
        {
            ret = data.data.return
        }
        else
        {
            ret = location.pathname
        }
        if ("sticky")
        {
            sticky = data.data.sticky;
        }
        else
        {
            sticky = "0";
        }

        timeout_params += "timeout=" + timeout + "&return=" + ret + "&sticky=" + sticky;
    }    
    window.location.href = data.data.target + location.search + timeout_params;           
}

function customNotify(data)
{
    var modal = document.getElementById("customNotification");

    if (data.data.text)
    {
        text = data.data.text
    }
    else
    {
        text = "you should pass something to be displayed here"
    }
    if (data.data.timeout)    
    {
        timeout = data.data.timeout;
    }
    else
    {
        timeout = 0;
    }

    console.log('about to show: ' + text)
    //modal.innerHTML = '<div class="widget" style="float: left; z-index:1;">' +
    //modal.innerHTML = '<div class="widget">' +
    //                  '<p>' + text  +
    //                  '<span class="close"> &times;</span>'
    //                  '</div></div>'
    modal.innerHTML = '<p>' + text  + '<span class="close"> &times;</span>'
    
    modal.style.display = "block"

    if (timeout > 0)
    {
        setTimeout(function() { modal.style.display = "none"}, timeout*1000);
    }

    //close notification
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function() {
        
            modal.style.display = "none";
    }
}

function createModal()
{
    let ndiv = document.createElement('div');
    ndiv.id = 'customNotification';
    ndiv.class = 'widget';
    ndiv.style = 'position: absolute; z-index: 100; padding: 20px; font-size:120%; border:2px solid; margin: 20px;'
    ndiv.style.display = "none";
    
    window.document.body.insertBefore(ndiv, window.document.body.firstChild);
    
}