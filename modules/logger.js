class Logger {
    constructor(pool, keycloak) {
        this.pool = pool;
        this.keycloak = keycloak;
    }
    
    async log(req, message) {
        try {
            let user_info = await this.keycloak.grantManager.userInfo(req.kauth.grant.access_token);
            message = message.replace("%USER%", user_info.preferred_username);
            await this.pool.query('INSERT INTO `web_log`(`user_id`, `message`) VALUES (?,?) ', [user_info.sub, message]);
        } catch(err) {
            console.log("Log failed: " + err.message);
        }
    }
}


module.exports = Logger;
