function User(pool, passport, bcrypt) {
    this.pool = pool;
    this.passport = passport;
    this.crypt = bcrypt;
    this.promise = require('promise');
    var me = this;
    LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(
        function (username, password, done) {
            var dat = me.Authenticate(username, password).done(function (res) {
                var userhash = username + ":" +res.hash;
                if (res.success) {
                    me.GetUserInfo(username, userhash).done(function (dat) {
                        if (dat.success && me.IsStaff(dat.user.user_group_id)) {
                            dat.user.userhash = userhash;
                            done(null, dat.user);
                        } else
                            done(null, false, {
                                message: "You are not allowed"
                            });
                    });

                } else {
                    done(null, false, {
                        message: res.message
                    });
                }
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
};

User.prototype.Authenticate = function (username, password) {
    var request = require('superagent-promise')(require('superagent'), this.promise);
    return request
        .get('https://baystation12.net/forums/api.php')
        .query({
            action: 'authenticate',
            username: username,
            password: password
        })
        .end()
        .then(function onResult(res) {
            var data = res.body;
            data.success = true;
            return data;
        }, function onError(err) {
            var data = err.response.res.body;
            data.success = false;
            if (data.error) {
                switch (data.error) {
                case 1:
                    data.message = "Username or password cannot be empty."
                    break;
                case 4:
                    data.message = "User doesn't exist"
                    break;
                case 5:
                    data.message = "Wrong username or password"
                    break;
                }
            };
            return data;
        });
};
User.prototype.IsStaff = function(groupId) {
    var staffId = [3,22,23,27,28,32];
    if(staffId.indexOf(groupId) != -1)
        return true;
    else
        return false;
};
User.prototype.IsAdmin = function(groupId) {
    var staffId = [3,22,23,27,28,32];
    if (staffId.indexOf(groupId) != -1)
        return true;
    else
        return false;
};
User.prototype.GetUserInfo = function (username, userhash) {
    var request = require('superagent-promise')(require('superagent'), this.promise);
    return request
        .get('https://baystation12.net/forums/api.php')
        .query({
            action: 'getUser',
            value: username,
            hash: userhash
        })
        .end()
        .then(function (res) {
            var data = res.body;
            if (res.error)
                return fulfill({
                    success: false
                });
            data = {};
            data.success = true;
            data.user = res.body;
            return data;
        });
};



User.prototype.GetUserAvatar = function (username, userhash) {
    var request = require('superagent-promise')(require('superagent'), this.promise);
    return request
        .get('https://baystation12.net/forums/api.php')
        .query({
            action: 'getAvatar',
            value: username,
            hash: userhash
        })
        .end()
        .then(function (res) {
            var data = res.body;
            data.success = true;
            return data;
        }, function (err) {
            var data = err.response.res.body;
            data.success = false;
            return data;
        });
};
module.exports = User;
