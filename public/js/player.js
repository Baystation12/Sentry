moment.locale('en', {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "seconds",
        m: "%d minute",
        mm: "%d minutes",
        h: "%d hour",
        hh: "%d hours",
        d: "%d day",
        dd: "%d days",
        M: "%d month",
        MM: "%d months",
        y: "%d year",
        yy: "%d years"
    }
});
$('#archiveTable')
    .transition('slide down');
String.prototype.trunc =
    function(n, useWordBoundary) {
        var isTooLong = this.length > n,
            s_ = isTooLong ? this.substr(0, n - 1) : this;
        s_ = (useWordBoundary && isTooLong) ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
        return isTooLong ? s_ + '&hellip;' : s_;
    };
$('.dropdown')
    .dropdown({
        action: 'select',
        onChange: function(value, text, $selectedItem) {
            $("#raceInput").val(text);
        }
    });

$('#archiveHeader').click(function() {
    $('#archiveTable')
        .transition('slide down');
    if ($('#archiveHeaderIcon').hasClass('chevron up')) {
        $('#archiveHeaderIcon').attr("class", "chevron down icon")
    } else {
        $('#archiveHeaderIcon').attr("class", "chevron up icon")
    }
});
$('#archiveHeader').mouseover(function() {
    $('#archiveHeader').addClass('blue')
});
$('#archiveHeader').mouseleave(function() {
    $('#archiveHeader').removeClass('blue')
});
// taken from https://stackoverflow.com/a/9609450
var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();
function formatBanRow(type, admin, comments,data) {
    var extra = "";
    switch (type) {
        case "JOB_PERMABAN":
            type = "JOBBAN";
            extra = data.job;
            break;
        case "TEMPBAN":
            type = "BAN";
            break;
        case "PERMABAN":
            type = "BAN";
            break;
        case "JOB_TEMPBAN":
            type = "JOBBAN";
            extra = data.job;
            break;
    }
    comments = decodeEntities(comments.replace(/#/g,"&#"));
    var duration = "PERMANENT";
    if(data.duration > 0) {
        duration = moment.duration(data.duration,'minutes').humanize();
    }
    var id = window.commentId++;
    window.comments[id.toString()] = comments;
    var str = `<tr><td class='single-line'>${type}</td><td>${duration}</td><td>${admin}</td><td class="clickable" onClick='showBanComment("${id}")'>${comments.trunc(200,true)}</td><td>${moment(data.bantime).calendar();}</td><td>${extra}</td></tr>`
    return str;
}
window.commentId = 0;
window.comments = {};
function showBanComment(commentId) {
    $("#modal div.content p").html(window.comments[commentId]);
    $('#modal').modal('show');
}


function addWhitelist() {
    $("#errMsg").hide();
    $("#whitelistSegment").addClass("loading");
    $.ajax({
        url: "/add-whitelist",
        data: {
            key: window.user,
            race: $("#raceInput").val()
        },
        type: "POST"
    }).done(function(data) {
        if (data.success === true) {
            updateWhitelist();
            $("#raceInput").val("");
        } else {
            $("#errMsg").show();
            $("#errMsg p").html(data.message);
        }
    }).always(function() {
        $("#whitelistSegment").removeClass("loading");
    });
}

function updateWhitelist() {
    $.ajax({
        url: "/get-whitelist",
        data: {
            key: window.user
        },
        type: "POST"
    }).done(function(data) {
        var count = 0;
        $("#whiteTable tbody tr").empty();
        $.each(data.rows, function(index, value) {
            var str = "<tr><td>" + value.race + "</td><td class='right aligned'><form class='whitelist_form'><input type='hidden' name='race' value=\"" + value.race + "\"/><button class='negative ui button mini icon'><i class='delete icon'></i></button></form></td></tr>";
            $("#whiteTable tbody").append(str);
        });
        $(".whitelist_form button").click(function(e) {
            var race = $(this).prev('input').val();
            var button = $(this);
            $(this).addClass("loading");
            $.ajax({
                url: "/remove-whitelist",
                data: {
                    key: window.user,
                    race: race
                },
                type: "POST"
            }).done(function(data) {
                if (data.success === false) {
                    alert(data.message);
                }
            }).always(function() {
                updateWhitelist();
            });

            e.preventDefault();
        });
    });
};



function updateStats() {
    $('#statSegment').addClass("loading");
    var jqxhr = $.ajax({
            url: "/get-statistics",
            data: {
                key: window.user
            },
            crossDomain: true,
            type: "POST"
        })
        .done(function(data) {
            var lastseen = moment(data.lastseen).fromNow().split(" ");
            $("#lastseen .value").html(lastseen[0]);
            $("#lastseen .label:eq( 1 )").html(lastseen[1] + " " + lastseen[2]);

            lastseen = moment(data.firstseen).fromNow().split(" ");
            $("#firstseen .value").html(lastseen[0]);
            $("#firstseen .label:eq( 1 ) ").html(lastseen[1] + " " + lastseen[2]);
            $("#ip .value").html(data.ip);
            $("#cid .value").html(data.cid);
            $("#bans .value").html(data.ban_count);
            $("#whitelist .value").html(data.whitelist_count);

            $('#statSegment').removeClass("loading");
            $.ajax({
                url: "/get-location",
                data: {
                    ip: data.ip
                },
                type: "POST"
            }).done(function(data) {
                data = JSON.parse(data);
                if (data.country_code)
                    $("#country .value").html(data.country_code);
                else
                    $("#country .value").html("UNK");
            });

        })
        .fail(function() {
            $('#statSegment').removeClass("loading");
        })
        .always(function() {
            $('#statSegment').removeClass("loading");
        });

}



function updateBans() {
    $('#banSegment').addClass("loading");

    $.ajax({
        url: "/get-bans",
        data: {
            key: window.user
        },
        type: "POST"
    }).done(function(data) {
        var bannedCount = 0;
        var unbannedCount = 0;
        window.data_rows = data.rows;
        $.each(data.rows, function(index, value) {
            if (value.unbanned == null && value.duration === -1 || value.duration > 0 && moment(value.expiration_time).isAfter(moment())) {
                bannedCount++;
                var str = formatBanRow(value.bantype, value.a_ckey, value.reason,value);
                $("#banTable tbody").append(str);
            } else {
                var str = formatBanRow(value.bantype, value.a_ckey, value.reason,value);
                $("#archiveTableR tbody").append(str);
                unbannedCount++;
            }
        });
        if (unbannedCount <= 0)
            $("#archiveHeader").hide();
        if (bannedCount <= 0)
            $("#banTable").hide();
        $("#bans .value").html(bannedCount);
        $('#banSegment').removeClass("loading");
    });
}




$(function() { //shorthand document.ready function
    $("#errMsg").hide();
    $("#raceAdd").click(function(e) {
        addWhitelist();
        e.preventDefault();
    });
    updateStats();
    updateBans();
    updateWhitelist();
});