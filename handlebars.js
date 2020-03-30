module.exports = function(exphbs,app) {
    var hbs = exphbs.create({
        // Specify helpers which are only registered on this instance. 
        helpers: {
            'hasRole': function(role) {
                return this.kauth.grant.access_token.hasRole(role);
            },
            'moment': function(options){
                var moment = require("moment");
                var date = moment(options.fn(this));
                return date.format("MMMM Do YYYY");
            }
        },
        partialsDir:__dirname + '/views/partials',

        defaultLayout: ''
    });

    app.engine('handlebars', hbs.engine);
};
