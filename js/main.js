$(document).ready(function() {
    $("#register").hide();
});

$("#registerFrm").click(function() {
    $("#register").show();
    $("#login").hide();
    $("#loginFrm").removeClass("active");
    $("#registerFrm").addClass("active");
});

$("#loginFrm").click(function() {
    $("#register").hide();
    $("#login").show();
    $("#registerFrm").removeClass("active");
    $("#loginFrm").addClass("active");
});

$("#ibtnLogin").click(function(e) {
    e.preventDefault();
    let Username = $("#username").val();
    let Email = $("#email").val();
    let Password = $("#password").val();
    const obj = {
        Username: Username,
        Email: Email,
        Password: Password,
    };

    fetch("https://localhost:44398/api/login/Login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(obj),
        })
        .then((response) => response.json())
        .then((json) => {
            $("#alert").html("");
            if (json.messageId == 1) {
                localStorage.removeItem("token");
                localStorage.setItem("token", json.object.token)
                window.location = "home.html";
            } else if (json.messageId == 2) {
                $("#alert").append(`<div class="alert alert-danger" role="alert">
                ${json.message}
              </div>`);
            } else if (json.messageId == 3) {
                $("#alert").append(`<div class="alert alert-danger" role="alert">
                ${json.message}
              </div>`);
            }
        })
        .catch((response) => {
            alert("Problema al conectarse con la API: " + response);
        });
});

$("#ibtnRegister").click(function(e) {
    e.preventDefault();
    let Username = $("#usernameR").val();
    let Email = $("#emailR").val();
    let Password = $("#passwordR").val();
    const obj = {
        Username: Username,
        Email: Email,
        Password: Password,
    };

    fetch("https://localhost:44398/api/users/CreateUser", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(obj),
        })
        .then((response) => response.json())
        .then((json) => {
            $("#alert").html("");
            if (json.messageId == 1) {
                $("#alert").append(`<div class="alert alert-success" role="alert">
                ${json.message}
              </div>`);
                $("#register").hide();
                $("#login").show();
                $("#registerFrm").removeClass("active");
                $("#loginFrm").addClass("active");
                $("#username").val("");
                $("#email").val("");
                $("#password").val("");
            } else if (json.messageId == 2) {
                $("#alert").append(`<div class="alert alert-danger" role="alert">
                ${json.message}
              </div>`);
            } else if (json.messageId == 0) {
                $("#alert").append(`<div class="alert alert-danger" role="alert">
                ${json.message}
              </div>`);
            }
        });
});