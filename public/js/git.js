$("#messageBox").hide();
$("#messageBoxError").hide();
$("#messageBoxsuccess").hide();
$("#updateButton").click(function () {
    $("#messageBox").show();
    $("#messageBoxError").hide();
    $("#messageBoxsuccess").hide();
    $("#messageBoxText").html("Attempting to update the server");
    var jqxhr = $.ajax("/update-server")
        .done(function (data) {
            if(data.success)
            {
                $("#messageBoxsuccess").show();
                $("#messageBoxsuccessText").html(data.message);
            }
            else
            {
                $("#messageBoxError").show();
                $("#messageBoxError p").text(data.message);
            }
            updatecommit();
        })
        .fail(function () {
            $("#messageBoxError").show();

        })
        .always(function () {
            $("#messageBox").hide();
        });
});

function updatecommit() {
    $("#commitwindow").addClass("loading");
    var jqxhr = $.ajax("/current-commit")
        .done(function (data) {
            $("#commitH .sub").text(data.message +" from "+moment(data.date).fromNow());
            $("#commitH .sub").append("<a href='"+repositoryLink+""+data.sha+"'><i class='linkify link icon'></i></a>");
            $("#commitwindow").removeClass("loading");
        })
        .fail(function () {

        })
        .always(function () {
        });
}
