function search() {
    $(".segment").addClass("loading");
    $(".table tbody").empty();
    $.ajax({
        url: "/find-books",
        data: {
            title: $("#searchInput").val()
        },
        type: "GET"
    }).done(function (data) {
        if (data.success === true) {
            $.each(data.rows, function (index, value) {
                var str = '<tr><td><h4 class="ui image header"><img src="https://robohash.org/'+value.title+'?size50x50" class="ui mini rounded image">'
                str += '<div class="content"><a href="/book/'+value.id+'">'+value.title+'</a>'
                str += '<div class="sub header">'+value.author+'</div></div></td></tr>'
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
        url: "/get-books",
        data: {},
        type: "GET"
    }).done(function (data) {
        if (data.success === true) {
            $.each(data.rows, function (index, value) {
                var str = '<tr><td><h4 class="ui header"><i class="book icon"></i></h4>'
                str += '<div class="content"><a href="/book/'+value.id+'">'+value.title+'</a>'
                str += '<div class="sub header">'+value.author+'</div></div></td></tr>'
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