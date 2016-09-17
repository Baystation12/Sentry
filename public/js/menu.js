function LoadAvatar(userid,id)
{
    $.get("/getavatar",{user:userid}).done(function(data) {
       data.avatar = data.avatar.replace("/data/","/forums/data/");
       if(data.avatar.indexOf("https") == -1)  {
       data.avatar = data.avatar.replace("http","https");
	}
       $("[id="+id+"]").attr('src',(data.avatar));
    });
}

