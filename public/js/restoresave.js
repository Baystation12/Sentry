$(function () { //shorthand document.ready function
	$("#messageBox").hide();
	$("#messageBoxError").hide();
	$("#messageBoxsuccess").hide();
	$("#savesubmit").click(function () {
		$("#messageBoxText").html("Attempting to restore save");
		$("#messageBox").show();
		$("#messageBoxError").hide();
		$("#messageBoxsuccess").hide();
		$.post("/restore-save", {ckey: $("#ckey").val(), date: $("#date").val()})
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
			})
			.fail(function () {
				$("#messageBoxError").show();
			})
			.always(function () {
				$("#messageBox").hide();
			});
	});
});
