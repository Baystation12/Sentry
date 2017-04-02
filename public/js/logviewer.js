function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1)
};

function makeLink(ckey) {
    return '<a href="/player/' + ckey + '">' + capitalize(ckey) + '</a>'
}

function shorten(text) {
    if (text.indexOf(".") <= 0)
        return text;
    return decodeURIComponent(text.substr(0, text.indexOf(".")));
}
$(function () { //shorthand document.ready function
    run();
});


function run()
{
    if (!window.page)
        window.page = 0;
    $.ajax({
        url: "/latest-log",
        data: {
            skip: window.page * 20,
            limit: 20
        },
        type: "GET"
    }).done(function (data) {
        $("#logFeed").empty();
        if (data.success === true) {
            $.each(data.rows, function (index, value) {
                var str = '<div class="event"><div class="label"><img id=avatar_' + value.user_id + ' src=""></div><div class="content"><div class="summary">' + capitalize(value.message) + '<div class="date">' + moment(value.when).fromNow() + '</div></div></div></div>';
                $("#logFeed").append(str);
                LoadAvatar(value.user_id, "avatar_" + value.user_id);
            });
        } else {
            alert(data.message);
        }
    });

    $.get("/logs-pages").done(function (data) {
        $("#pag").empty();
        for (i = 0; i < data.pages; i++) {
            if(i == window.page)
                $("#pag").append('<a class="item active log">'+(i+1)+'</a>');
            else
                $("#pag").append('<a class="item log">'+(i+1)+'</a>');
        }
        $("a.item.log").click(function(eh) {
            window.page = Number($(this).text())-1;
            run();
        });
    });
}