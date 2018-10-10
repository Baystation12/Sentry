var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var flash = require('connect-flash');
var passport = require('passport');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var app = express();
var promise = require('promise');
var rp = require('request-promise-native');
const url = require('url');
//var FileStore = require('session-file-store')(session);
require('shelljs/global');

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));


var pool = mysql.createPool({
    connectionLimit: config.mysql_limit,
    host: config.mysql_host,
    user: config.mysql_user,
    database: config.mysql_db,
    password: config.mysql_password
});
console.log(config);

app.use(bodyParser.urlencoded({
    extended: false
}))



// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());

app.use(session({
    secret: config.session_secret,
    saveUninitialized: false,
    resave: false
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(__dirname + '/public'));
app.use("/player", express.static(__dirname + '/public'));
app.use("/book", express.static(__dirname + '/public'));
app.set('view engine', 'handlebars');

require('./handlebars.js')(exphbs, app);
var User = new(require("./modules/user.js"))(pool, passport, bcrypt);
var Logger = new(require("./modules/logger.js"))(pool);

require("./routes/user.js")(app, passport, User, pool);
require("./routes/logs.js")(app, pool);
require("./routes/books.js")(app, pool,Logger);
require("./routes/serverlog.js")(app, config.log_path);



_running_update = false;





app.get("/view-logs",function(req,res) {
    if(!req.user) {
        res.redirect("/")
        return;
    };
    res.render("viewlog",{user:req.user});
});

app.get("/view-serverlogs",function(req,res) {
    if(!req.user) {
        res.redirect("/")
        return;
    };
    res.render("viewserverlog",{user:req.user});
});

app.get("/saverestore", function(req,res) {
    if(!req.user) {
        res.redirect("/")
        return;
    };
    res.render("restoresave",{user:req.user});
});


app.get('/', function (req, res) {
    var flash = req.flash();
    if (!req.user) {
        var error = flash["error"];
        res.render("index", {
            error: error
        });
    } else {
        res.render("dashboard", {
            user: req.user
        });
    }
});

app.get('/book', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.redirect("/");
        return;
    }
    res.render("booksearch", {
        user: req.user
    });
});
app.options('/book/:key');
app.get('/book/:key', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.redirect("/");
        return;
    }
    if (!req.params.key) {
        res.redirect("/book");
    } else {
        if (req.params.key)
            res.render("book", {
                id: req.params.key,
                user: req.user
            });
    }
});
app.get('/player', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.redirect("/");
        return;
    }
    res.render("playersearch", {
        user: req.user
    });
});
app.options('/player/:key');
app.get('/player/:key', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.redirect("/");
        return;
    }
    if (!req.params.key) {
        res.redirect("/player");
    } else {
        if (req.params.key)
            res.render("player", {
                ckey: req.params.key,
                user: req.user
            });
    }
});

function monitorRequest(method, endpoint, body) {
    if (!body)
	body = {}
    return rp({
        uri: config.monitor_url + "/" + endpoint,
        json: true,
        method: method,
	formData: body,
        auth: {
            user: "auth",
            pass: config.monitor_key
        }
    });
}

var isRunning = function () {
    return monitorRequest("GET", "is_running").then((res) => {
        return {server: res.message}
    }).catch((_) => {
        return {server: false}
    });
};

app.get('/is-server-alive', function (req, res) {
    isRunning().then((data) => {
        res.send(data);
    });
});
app.get('/start-server',function(req,res) {
    if (!req.user) {
        res.sendStatus(403);
        return;
    }
    isRunning().then(function(data) {
        if(data.server)
        {
            res.send({success:false, message:"Server is already running.."});
            return;
        }
        Logger.log(req.user, req.user.username + " has started the server..")
        return monitorRequest("POST", "start").then((monRes) => {
            res.send(monRes);
        });
    });
});
app.get('/stop-server',function(req,res) {
    if (!req.user) {
        res.sendStatus(403);
        return;
    }
    isRunning().then(function(data) {
        if(!data.server)
        {
            res.send({success:false, message:"Server is already stopped.."});
            return;
        }
        Logger.log(req.user, req.user.username + " has stopped the server..")
        return monitorRequest("POST", "stop").then((monRes) => {
            res.send(monRes);
        });
    });
});
app.get('/current-commit', function (req, res) {
    if (!req.user) {
        res.sendStatus(403);
        return;
    }

    monitorRequest("GET", "commit").then((monRes) => {
        res.send(monRes.message);
    });
});
app.get('/update-server', function (req, res) {
    if (!req.user) {
        res.sendStatus(403);
        return;
    }
    if(_running_update)
    {
        res.send({success:false,message:"Server is already being updated"});
        return;
    }
    isRunning().then(function(data) {
        if(data.server)
        {
            res.send({success:false,message:"Stop the server first.."});
            return;
        }
        _running_update = true;
        Logger.log(req.user, req.user.username + " has updated the server..")
        return monitorRequest("POST", "update").then((monRes) => {
            res.send(monRes);
            _running_update = false;
        });
    });
});
app.post('/restore-save', function (req, res) {
	if (!req.body.ckey || !req.body.date) {
		res.send({
			success: false,
			message: "Missing arguments (date or key)"
		});
		return;
	}
	monitorRequest("POST", "restoresave", {ckey: req.body.ckey, date: req.body.date}).then((monRes) => {
		res.send(monRes);
	});
});
app.post('/get-byondaccount', function (req, res) {
    if (!req.body.ckey) {
        res.send({
            success: false,
            message: "No key provided"
        });
        return;
    };
    var request = require('request');
    request('http://www.byond.com/members/' + req.body.ckey + "?format=text", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = {};
            var lines = body.split(/\r?\n/);
            lines.forEach(function(entry) {
                console.log(entry);
                if(entry.includes("=")) {
                    var split = entry.split("=");
                    var key = split[0].trim().replace(/\"/g,"");
                    var value = split[1].trim().replace(/\"/g,"");
                    data[key] = value;
                };
            });
            res.send(JSON.stringify(data));
        };
    });
});
app.post('/get-statistics', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.send({
            success: false,
            message: "Not logged in"
        });
        return;
    }
    if (!req.body.key) {
        res.send({
            success: false,
            message: "No key provided"
        });
        return;
    }
    pool.getConnection(function (err, connection) {
        if (err) {
            res.send({
                success: false,
                message: err
            });
            return;
        }
        // TODO LOWERCASE AND REMOVE SPACES
        connection.query('SELECT `firstseen`, `lastseen`, `ip`, `computerid`, (SELECT COUNT(*) FROM `whitelist` WHERE `ckey` = ?) AS `whitelist_count`, (SELECT COUNT(*) FROM `erro_ban` WHERE `ckey` = ? AND `expiration_time` > NOW() AND (unbanned IS NULL)) AS `ban_count` FROM `erro_player` WHERE `ckey` = ?', [req.body.key, req.body.key, req.body.key], function (err, rows) {
            connection.release();
            if (err) {
                res.send({
                    success: false,
                    message: err
                });
                return;
            }
            if (rows.count <= 0) {
                res.send({
                    success: false,
                    message: "cancer"
                });
                return;
            }
            var row = rows[0];
            if (!row) {
                res.send({
                    success: false,
                    message: "cancer"
                });
                return;
            }
            res.send({
                success: true,
                firstseen: row.firstseen,
                lastseen: row.lastseen,
                cid: row.computerid,
                ip: row.ip,
                whitelist_count: row.whitelist_count,
                ban_count: row.ban_count,
            });
        });
    });
});

app.post('/get-location', function (req, res) {
    var request = require('request');
    request('http://www.freegeoip.net/json/' + req.body.ip, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        }
    })
});
app.post('/get-bans', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.send({
            success: false,
            message: "Not logged in"
        });
        return;
    }
    if (!req.body.key) {
        res.send({
            success: false,
            message: "No key provided"
        });
        return;
    }
    pool.getConnection(function (err, connection) {
        if (err) {
            res.send({
                success: false,
                message: err
            });
            return;
        }
        // TODO LOWERCASE AND REMOVE SPACES
        connection.query('SELECT * FROM `erro_ban` WHERE ckey = ? ORDER BY bantime DESC', [req.body.key], function (err, rows) {
            connection.release();
            if (err) {
                res.send({
                    success: false,
                    message: err
                });
                return;
            }
            if (rows.count <= 0) {
                res.send({
                    success: false,
                    message: "cancer"
                });
                return;
            }
            res.send({
                success: true,
                rows: rows
            });
        });
    });
});
app.post('/get-whitelist', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.send({
            success: false,
            message: "Not logged in"
        });
        return;
    }
    if (!req.body.key) {
        res.send({
            success: false,
            message: "No key provided"
        });
        return;
    }
    pool.getConnection(function (err, connection) {
        if (err) {
            res.send({
                success: false,
                message: err
            });
            return;
        }
        // TODO LOWERCASE AND REMOVE SPACES
        connection.query('SELECT * FROM `whitelist` WHERE ckey = ?', [req.body.key], function (err, rows) {
            connection.release();
            if (err) {
                res.send({
                    success: false,
                    message: err
                });
                return;
            }
            if (rows.count <= 0) {
                res.send({
                    success: false,
                    message: "cancer"
                });
                return;
            }
            res.send({
                success: true,
                rows: rows
            });
        });
    });
});


app.post('/remove-whitelist', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.send({
            success: false,
            message: "Not logged in"
        });
        return;
    }
    if (!req.body.key) {
        res.send({
            success: false,
            message: "No key provided"
        });
        return;
    }
    if (!req.body.race) {
        res.send({
            success: false,
            message: "No race provided"
        });
        return;
    }
    Logger.log(req.user, req.user.username + " has removed " + req.body.key + " whitelisting for " + req.body.race)
    pool.getConnection(function (err, connection) {
        if (err) {
            res.send({
                success: false,
                message: err
            });
            return;
        }
        req.body.key = req.body.key.toLowerCase();
        req.body.race = req.body.race.toLowerCase();
        connection.query('DELETE FROM `whitelist` WHERE ckey = ? AND race = ?', [req.body.key, req.body.race], function (err, rows) {
            connection.release();
            if (err) {
                res.send({
                    success: false,
                    message: err
                });
                return;
            }
            res.send({
                success: true
            });
        });
    });
});
app.post('/add-whitelist', function (req, res) {
    if (!req.user || req.user.rank < 1) {
        res.send({
            success: false,
            message: "Not logged in"
        });
        return;
    }
    if (!req.body.key) {
        res.send({
            success: false,
            message: "No key provided"
        });
        return;
    }
    if (!req.body.race) {
        res.send({
            success: false,
            message: "No race provided"
        });
        return;
    }
    Logger.log(req.user, req.user.username + " has whitelisted " + req.body.key + " for " + req.body.race)
    req.body.key = req.body.key.toLowerCase();
    req.body.race = req.body.race.toLowerCase();
    pool.getConnection(function (err, connection) {
        if (err) {
            res.send({
                success: false,
                message: err
            });
            return;
        }
        // TODO LOWERCASE AND REMOVE SPACES
        connection.query('INSERT INTO `whitelist` (ckey,race) VALUES (?,?)', [req.body.key, req.body.race], function (err, rows) {
            connection.release();
            if (err) {
                res.send({
                    success: false,
                    message: err
                });
                return;
            }
            res.send({
                success: true
            });
        });
    });
});





if(config.https_enabled)
{
    const https = require('https');
    const options = {
      key: fs.readFileSync(config.https_key),
      cert: fs.readFileSync(config.https_cert)
    };
    https.createServer(options, app).listen(config.https_port);
    console.log('Example app listening at https')
}

if(config.http_enabled)
{
    var server = app.listen(config.http_port, function () {

        var host = server.address().address
        var port = server.address().port

        console.log('Example app listening at http://%s:%s', host, port)

    })
}
