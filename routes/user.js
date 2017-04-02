/*
3 = Admin(me)
27 = Devs
23 = Game Admin
26 = Game Mod
22 = Headmin
28 = headdev

*/
module.exports = function (app, passport, User,pool) {
    app.get('/signup', function (req, res) {
        var flash = req.flash();
        var error = flash["error"];
        res.render("signup", {
            error: error
        });
    });
    app.get('/getavatar', function (req, res) {
        if (!req.user) {
            res.sendStatus(500);
            return;
        };
    //    User.GetUserInfo(req.query.user,req.user.userhash).done(function (dat) {
    //        console.log(req);
            User.GetUserAvatar(req.query.user, req.user.userhash).done(function (dat) {
                res.send(dat);
            });
     //   });
    });
    app.post('/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        })
    );
    app.post('/search-users', function (req, res) {
        if (!req.user) {
            res.sendStatus(500);
            return;
        }
        if (!req.body.search) {
            pool.getConnection(function (err, connection) {
                connection.query('SELECT * FROM `erro_player` ORDER BY `lastseen` DESC LIMIT 30', function (err, rows) {
                    if (err) {
                        var data = {
                            success: false,
                            message: err.message
                        };
                        res.send(data);
                    } else {
                        var data = {
                            success: true,
                            rows: rows
                        };
                        res.send(data);
                    }
                    connection.release();
                });
            });
        } else {
            pool.getConnection(function (err, connection) {
                connection.query("SELECT * FROM `erro_player` WHERE `ckey` LIKE ? ORDER BY `lastseen` DESC LIMIT 30", [req.body.search + "%"], function (err, rows) {
                    if (err) {
                        var data = {
                            success: false,
                            message: err.message
                        };
                        res.send(data);
                    } else {
                        var data = {
                            success: true,
                            rows: rows
                        };
                        res.send(data);
                    }
                    connection.release();
                });
            });
        }
    });
    app.get('/profile', function (req, res) {
        if (!req.user) {
            res.redirect("/");
            return;
        }
        if (req.query.user) {
            res.sendStatus(500);
        } else {
            res.render("profile", {
                user: req.user
            });
        }
    });
}