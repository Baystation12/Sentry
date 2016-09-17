function ban2text(type) {
    switch (type) {
    case "JOB_PERMABAN":
        type = "permanent job ban";
        break;
    case "TEMPBAN":
        type = "temporary ban";
        break;
    case "PERMABAN":
        type = "permanent ban";
        break;
    case "JOB_TEMPBAN":
        type = "temporary job ban";
        break;
    }
    return type;
};

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

function isRunning() {
    $.get("/is-server-alive").done(function (data) {
        window.server = data.server;
        if (data.server) {
            $("#startButton").text("Stop Server");
            $("#startButton").removeClass("positive");
            $("#startButton").addClass("negative");
        }
    });
}









$(function () { //shorthand document.ready function
    updatecommit()
    $.get("status.dat", function (data) {
        data = JSON.parse(data);
        $("#player").html(data.players);
        $("#mode").html(data.mode);
        $("#admin").html(decodeURIComponent(data.roundduration));
    });
    $.ajax({
        url: "/latest-log",
        type: "GET"
    }).done(function (data) {
        if (data.sucess === true) {
            $.each(data.rows, function (index, value) {
                var str = '<div class="event"><div class="label"><img id=avatar_' + value.user_id + ' src=""></div><div class="content"><div class="summary">' + capitalize(value.message) + '<div class="date">' + moment(value.when).fromNow() + '</div></div></div></div>';
                $("#logFeed").append(str);
                LoadAvatar(value.user_id, "avatar_" + value.user_id);
            });
        } else {
            alert(data.message);
        }
    });
    $.ajax({
        url: "/latest-bans",
        type: "GET"
    }).done(function (data) {
        if (data.sucess === true) {
            $.each(data.rows, function (index, value) {
                var text = '<div class="event"><div class="content">';
                text = text + '<div class="summary">' + makeLink(value.a_ckey) + ' applied a ' + ban2text(value.bantype) + ' to ' + makeLink(value.ckey) + '<div class="date">' + moment(value.bantime).fromNow() + '</div></div>';
                text = text + '<div class="extra text">' + capitalize(shorten(value.reason)) + '</div></div>';
                $("#banFeed").append(text);
            });
        } else {
            alert(data.message);
        }
    });
    isRunning();

    $("#startButton").click(function () {
        $("#messageBox").show();
        $("#messageBoxError").hide();
        $("#messageBoxSucess").hide();
        if (window.server) {
            $("#messageBoxText").html("Attempting to stop the server");
            $.get("/stop-server")
                .done(function (data) {
                    if(data.sucess)
                    {
                        $("#messageBoxSucess").show();
                        $("#messageBoxSucessText").html(data.message);
                    }
                    else
                    {
                        $("#messageBoxError").show();
                        $("#messageBoxError p").text(data.message);
                    }
                })
                .fail(function () {
                    $("#messageBoxError").show();
                })
                .always(function () {
                    $("#messageBox").hide();
                });
        } else {
            $("#messageBoxText").html("Attempting to start the server");
            $.get("/start-server")
                .done(function (data) {
                    if(data.sucess)
                    {
                        $("#messageBoxSucess").show();
                        $("#messageBoxSucessText").html(data.message);
                    }
                    else
                    {
                        $("#messageBoxError").show();
                        $("#messageBoxError p").text(data.message);
                    }
                })
                .fail(function () {
                    $("#messageBoxError").show();

                })
                .always(function () {
                    $("#messageBox").hide();
                });
        }

    });
});