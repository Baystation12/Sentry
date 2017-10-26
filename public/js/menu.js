var avatarCache = {};
function LoadAvatar(userid,id) {
    var avatar = "";
    if(avatarCache[userid] != null) {
            $("[id="+id+"]").attr('src',avatarCache[userid]);
    } 
    else {
        $.get("/getavatar",{user:userid}).done(function(data) {
            if(data.avatar.indexOf("https") == -1) 
                data.avatar = data.avatar.replace("http","https");
            avatarCache[userid] = data.avatar;
            $("[id="+id+"]").attr('src',(data.avatar));
        });
    }
}