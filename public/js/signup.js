$(document)
    .ready(function () {
        $('.ui.form')
            .form({
                fields: {
                    empty: {
                        identifier: 'username',
                        rules: [
                            {
                                type: 'empty',
                                prompt: 'Please enter your username'
                }
              ]
                    },
                    email: {
                        identifier: 'email',
                        rules: [
                            {
                                type: 'empty',
                                prompt: 'Please enter your email'
                },
                            {
                                type: 'email',
                                prompt: 'Please enter your a valid email'
                }
              ]
                    },
                    password: {
                        identifier: 'password',
                        rules: [
                            {
                                type: 'empty',
                                prompt: 'Please enter your password'
                },
                            {
                                type: 'length[6]',
                                prompt: 'Your password must be at least 6 characters'
                }
              ]
                    },
                    password: {
                        identifier: 'confirmpassword',
                        rules: [
                            {
                                type: 'empty',
                                prompt: 'Please enter your password'
                },
                            {
                                type: 'match[password]',
                                prompt: 'Passwords have to match'
                }
              ]
                    }
                }
            });
    });
$(".ui.form").submit(function (event) {
    event.preventDefault();
    var data = $('.ui.form').serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});
    $.post("signup", {
            username: data.username,
            email: data.email,
            password: data.password
        })
        .done(function (data) {
            alert("Data Loaded: " + data);
        });
});