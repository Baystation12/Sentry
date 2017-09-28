$(function() { //shorthand document.ready function
    $.ajax({
        url: "/get-book",
        data: {
            id: window.user
        },
        type: "GET"
    }).done(function(data) {
        console.log(data);
        $("#title").html(data.rows[0].title+"<div class='ui sub header'>"+data.rows[0].author+"</div>");
        $(".ui.blue.segment").html(data.rows[0].content);
    });
    $("#deleteButton").click(function() {
        $.ajax({
            url: "/delete-book",
            data: {
                id: window.user
            },
            type: "POST"
        }).done(function(data) {
            if(data.success)
                window.location.replace("/book");
        });
    })
});