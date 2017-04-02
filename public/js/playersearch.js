function search() {
    $(".segment").addClass("loading");
    $(".table tbody").empty();
    $.ajax({
        url: "/search-users",
        data: {
            search: $("#searchInput").val()
        },
        type: "POST"
    }).done(function (data) {
        if (data.success === true) {
            $.each(data.rows, function (index, value) {
            var str = '<tr><td><h4 class="ui image header"><img src="https://robohash.org/'+value.ckey+'?size50x50?" class="ui mini rounded image">'
            str += '<div class="content"><a href="/player/'+value.ckey+'">'+value.ckey+'</a>'
            str += '<div class="sub header">'+value.lastadminrank+'</div></div></td></tr>'
            $(".table tbody").append(str);
            });
        } else {
            alert(data.message);
        }
    }).always(function (data) {
            $(".segment").removeClass("loading");
    });
}


$(function () { //shorthand document.ready function
    $.ajax({
        url: "/search-users",
        data: {
            search: ""
        },
        type: "POST"
    }).done(function (data) {
        if (data.success === true) {
            $.each(data.rows, function (index, value) {
            var str = '<tr><td><h4 class="ui image header"><img src="https://robohash.org/'+value.ckey+'?size50x50" class="ui mini rounded image">'
            str += '<div class="content"><a href="/player/'+value.ckey+'">'+value.ckey+'</a>'
            str += '<div class="sub header">'+value.lastadminrank+'</div></div></td></tr>'
            $(".table tbody").append(str);
            });
        } else {
            alert(data.message);
        }
    })
    $("#searchButton").click(function (e) {
            e.preventDefault();
            search();
    });
    $('body').on('keypress', 'input', function(args) {
    if (args.keyCode == 13) {
        $("#searchButton").click();
        return false;
    }
});
});