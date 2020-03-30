/*
3 = Admin(me)
27 = Devs
23 = Game Admin
26 = Game Mod
22 = Headmin
28 = headdev

*/
module.exports = function (app, User, pool, keycloak) {
    app.post('/search-users', keycloak.protect('manage_players'), function (req, res) {
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
}
