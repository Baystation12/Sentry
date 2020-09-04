module.exports = function (app, pool,Logger, keycloak) {
    app.get('/get-books', keycloak.protect('manage_books'), function (req, res) {
        var options = {
            skip: 0,
            limit: 10
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
            connection.query('SELECT * FROM `library` ORDER BY `title` DESC LIMIT ?,?', [options.skip, options.limit], function (err, rows) {
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
    app.get('/find-books', keycloak.protect('manage_books'), function (req, res) {
        if(!req.query.title) {
            res.sendStatus(500);
            return;
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            connection.query('SELECT id,title,author FROM `library` WHERE title LIKE ? LIMIT 10', ["%"+req.query.title+"%"], function (err, rows) {
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
    app.get('/total-books', keycloak.protect('manage_books'), function (req, res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            connection.query('SELECT COUNT(id) FROM `library`', function (err, rows) {
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
    app.get('/get-book', keycloak.protect('manage_books'), function (req, res) {
        if (!req.query.id) {
            res.sendStatus(500);
            return;
        }
        var options = {
            id: Number(req.query.id)
        };
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            connection.query('SELECT * FROM `library` WHERE id=?',[options.id], function (err, rows) {
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
    app.post('/delete_book', keycloak.protect('manage_books'), function (req, res) {
        if (!req.body.id) {
            res.sendStatus(500);
            return;
        }
        var options = {
            id: Number(req.body.id)
        };
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                res.send(500);
            }
            Logger.log(req, "%USER% has deleted a book ("+req.body.id+")");
            connection.query('DELETE FROM `library` WHERE id=?',[options.id], function (err, rows) {
                if (err) {
                    var data = {
                        success: false,
                        message: err.message
                    };
                    res.send(data);
                } else {
                    var data = {
                        success: true
                    };
                    res.send(data);
                }
                connection.release();
            });
        });
    });
};
