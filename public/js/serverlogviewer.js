var fsmap = {};

$(function() {
	fsmap[""] = $("#loglist");
	$.post("/browselog", { "path": "/" }).done(function(data) {
		buildDirUI("", data);
	});
});

function buildDirUI(root, contents) {
	console.log(root);
	const dtempl = '<div class="item"><i class="folder icon"></i><div class="content"></div></div>'
	const ftempl = '<div class="item"><i class="file icon"></i><div class="content"></div></div>'
	for (var i = 0; i < contents.directories.length; ++i) {
		var direlem = $(dtempl);
		$(direlem).find(".content").text(contents.directories[i]);
		(function () {
			var path = root + "/" + contents.directories[i];
			$(direlem).click(function(event) {
				event.stopPropagation();
				if ($(fsmap[path]).children().length != 0) {
					$(fsmap[path]).slideToggle();
					return;
				}
				$.post("/browselog", { "path": path }, function(data) {
					buildDirUI(path, data);
				});
			});
		})();
		var sub = $('<div class="list" style="display: none"></div>');
		$(direlem).find(".content").append(sub);
		fsmap[root + "/" + contents.directories[i]] = sub;
		$(fsmap[root]).append(direlem);
	}
	for (var i = 0; i < contents.files.length; ++i) {
		var direlem = $(ftempl);
		$(direlem).find(".content").text(contents.files[i]);
		(function () {
			var path = root + "/" + contents.files[i];
			$(direlem).click(function(event) {
				event.stopPropagation();
				window.location = "/serverlogs" + path;
			});
		})();
		$(fsmap[root]).append(direlem);
	}
	$(fsmap[root]).slideDown();
}
