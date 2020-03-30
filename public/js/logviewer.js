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
                var str = '<div class="event"><div class="label"><img src="https://robohash.org/'+value.user_id+'?size50x50" class="ui mini rounded image"></div><div class="content"><div class="summary">' + capitalize(value.message) + '</div><div class="extra text"></div><div class="date">'+moment(value.when).format("dddd, MMMM Do YYYY, HH:mm:ss")+'</div></div></div>';
                $("#logFeed").append(str);
            });
        } else {
            alert(data.message);
        }
    });

    $.get("/logs-pages").done(function (data) {
        $("#pag").empty();
        var countL = 5;
        var countR = 5;
        if(window.page+countR > data.pages) {
            var dif = window.page+countR - data.pages;
            countR = 5 - dif;
            countL += dif;
        }
        console.log(countR);
        if(window.page-countL <= 0) {
            countR += (Math.abs(window.page-countL));
            countL = 5 - Math.abs(window.page-countL);
        }
        console.log(countR);
        for (i = Math.max(window.page-countL,0); i < Math.min(window.page+countR,data.pages); i++) {
            if(i == window.page)
                $("#pag").append('<a class="item active log">'+(i+1)+'</a>');
            else
                $("#pag").append('<a class="item log">'+(i+1)+'</a>');
        }
        $("#pag").append('<a class="item button">...</a>');
        $("a.item.log").click(function(eh) {
            window.page = Number($(this).text())-1;
            run();
        });
        window.maxPages = data.pages;
        $("a.item.button").click(function(eh) {
            var number = Number(prompt("Please enter a number between 1 and "+(window.maxPages), 0));
            if(isNaN(number)) {
                alert("Must be a number!");
                return;
            }
            if(number < 1 || number > window.maxPages+1) {
                alert("Out of bounds..");
                return;
            }
            window.page = number-1;
            run();
        });
    });
}
