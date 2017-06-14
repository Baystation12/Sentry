const path = require("path");
const fs = require("fs");

module.exports = function(app, logroot) {
	app.post("/browselog", function(req, res) {
		if (!req.user || !req.user.is_admin) {
			res.sendStatus(400);
			return;
		}
		var logpath = req.body.path;
		if (!logpath) {
			logpath = "/";
		}
		logpath = path.normalize(logroot + "/" + logpath);

		if (!logpath.startsWith(logroot)) {
			logpath = logroot;
		}

		fs.readdir(logpath, function(err, files) {
			if (err) {
				console.log(err);
				res.sendStatus(500);
				return;
			}
			var contents = { files: [], directories: [] };

			for (var i = 0; i < files.length; ++i) {
				var stat = fs.statSync(logpath + "/" + files[i]);
				if (stat.isDirectory()) {
					contents.directories.push(files[i]);
				} else {
					contents.files.push(files[i]);
				}
			}

			res.send(contents);
		});
	});
	app.get("/serverlogs/*", function(req, res) {
		if (!req.user || !req.user.is_admin) {
			res.sendStatus(400);
			return;
		}
		logpath = path.normalize(logroot + "/" + req.params[0]);
		if (!logpath.startsWith(logroot)) {
			res.sendStatus(404);
			return;
		}
		stat = fs.statSync(logpath);
		if (!stat.isFile()) {
			res.sendStatus(400);
			return;
		}
		res.download(logpath, path.basename(logpath));
	});
};
