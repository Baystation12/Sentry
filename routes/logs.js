module.exports = function (app, pool) {
    app.get('/latest-log', function (req, res) {
        var options = {
            skip: 0,
            limit: 20
        };
        if (req.query.skip)
            options.skip = Number(req.query.skip);
        if (req.query.limit)
            options.limit = Number(req.query.limit);
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            connection.query('SELECT * FROM `web_log` ORDER BY `when` DESC LIMIT ?,?', [options.skip, options.limit], function (err, rows) {
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
    });
    app.get('/logs-pages', function (req, res) {
        var options = {
            pageCount: 20
        };
        if (req.query.skip)
            options.skip = Number(req.query.skip);
        if (req.query.limit)
            options.limit = Number(req.query.limit);
        console.log(req.query);
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            connection.query('SELECT COUNT(id) FROM `web_log`', function (err, rows) {
                console.log(rows);
                if (err) {
                    var data = {
                        success: false,
                        message: err.message
                    };
                    res.send(data);
                } else {
                    var data = {
                        success: true,
                        pages: Math.ceil(rows[0]['COUNT(id)']/options.pageCount) 
                    };
                    res.send(data);
                }
                connection.release();
            });
        });
    });
    app.get('/latest-bans', function (req, res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            connection.query('SELECT * FROM `erro_ban` ORDER BY `bantime` DESC LIMIT 10', function (err, rows) {
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
    });
};
