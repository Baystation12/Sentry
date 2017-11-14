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
                addBook(value);
            });
        } else {
            alert(data.message);
        }
    }).always(function (data) {
            $(".segment").removeClass("loading");
    });
}

function addBook(value) {
    var str = '<tr><td><h4 class="ui header"><i class="book icon"></i>'
    str += '<div class="content"><a href="/book/'+value.id+'">'+value.title+'</a>'
    str += '<div class="sub header">'+value.author+'</div></div></h4></td></tr>'
    $(".table tbody").append(str);
}

function refresh(page,limit) {
	$(".table tbody").innerHTML = "";
	$.ajax({
        url: "/get-books",
        data: {
			skip: ((page-1) * limit),
			limit: limit
		},
        type: "GET"
    }).done(function (data) {
        if (data.success === true) {
            $.each(data.rows, function (index, value) {
                addBook(value);
            });
        } else {
            alert(data.message);
        }
    })
}

$(function () { //shorthand document.ready function
	var page_num = 1;
	var page_limit = 25;

	refresh(page_num, page_limit);

    $("#searchButton").click(function (e) {
            e.preventDefault();
            search();
    });
    $('body').on('keypress', 'input', function(args) {
    if (args.keyCode == 13) {
        $("#searchButton").click();
        return false;
    }

	$("#nextpButton").click(function() {
		page_num += 1;
        refresh(page_num, page_limit);
    });

	$("#prevpButton").click(function() {
		page_num -= 1;
		if(page_num<1) {page_num=1;};
        refresh(page_num, page_limit);
    });
});
