$('#messageBoxsuccess').hide();
$('#messageBoxError').hide();
$(function() { //shorthand document.ready function
    $('#changepassword').on('submit', function(e) { //use on if jQuery 1.7+
        e.preventDefault();  //prevent form from submitting
        $('#messageBoxsuccess').hide();
        $('#messageBoxError').hide();
        $('#changeButton').addClass("loading")
        var data = $("#changepassword :input").serializeArray();
        var jqxhr = $.ajax({url: "/change-password",data : data,type:"POST"})
            .done(function (data) {
                if(data.success)
                    $('#messageBoxsuccess').show();
                else
                    $('#messageBoxError').show();
                $('#changeButton').removeClass("loading");
            })
            .fail(function () {
changeButton.removeClass("loading");
                $('#messageBoxError').show();
            })
            .always(function () {
                $('#changeButton').removeClass("loading");
            });
    });
});