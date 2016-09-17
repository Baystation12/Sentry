function Logger(pool) {
  this.pool = pool;
};



Logger.prototype.log = function (user,message) {
    this.pool.getConnection(function (err, connection) {
        connection.query('INSERT INTO `web_log`(`user_id`, `message`) VALUES (?,?) ', [user.user_id, message], function (err, rows) {
            if (err) {
                console.log("Log failed: " + err.message);
            }
            connection.release();
        });
    });
};


module.exports = Logger;