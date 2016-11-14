# baystation12 - Sentry

[Website](http://baystation12.net/) - [IRC](irc://irc.sorcery.net/#codershuttle)

---

### LICENSE
Sentry is licensed under the GNU Affero General Public License version 3, which can be found in full in LICENSE

See [here](https://www.gnu.org/licenses/why-affero-gpl.html) for more information.

### Credits
Head - Original Author

### Dependencies
Sentry is designed to operate with XenForo and makes heavy utilization of the [xenAPI](https://github.com/Contex/XenAPI) for user authentication.
Sentry is built to run on Node 6.7 and has not been tested on any previous versions. Sentry also requires npm.

### Notes
Sentry was originally a closed-source panel and likely still contains a lot of hard-coded variables specifically for bay. We are currently in the process of conducting a code cleanup.

One of Sentry's dependencies (nodegit) requires that you manually build its binaries if you do not use one of [these](https://github.com/nodegit/nodegit/blob/master/.travis.yml#L15) node versions. For centOS, this means you need:
 - openssl
 - openssl-devel
 - openssl-static
 - gcc
 - gcc-c++

Once you have those dependencies run:

    npm install nodegit --build-from-source

### INSTALLATION
 - after cloning the repository, rename "config_example.json" to "config.json". Set up your configuration accordingly.
 - Run "npm install"
 - import sql/weblog.sql into your mySQL database.

### UPDATING
TODO

### Configuration
For initial configuration, rename "config_example.json" to "config.json"
