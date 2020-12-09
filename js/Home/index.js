$(document).ready(function() {
    ViewAlers();
    if (!localStorage.getItem("pagination")) {
        GetPosts(0);
    } else {
        var obj = JSON.parse(localStorage.getItem("pagination"));
        GetPosts(obj.back);
    }
    GetPaginators();

    $("#Spinner").hide();
    $("#img").on("change", function() {
        var validate = ValidateFile(this);
        if (validate) {
            var fileName = $(this).val().split("\\").pop();
            $(this)
                .siblings(".custom-file-label")
                .addClass("selected")
                .html(fileName);
        }
    });
});

var ValidateFile = (file) => {
    let ext = $(file).val().split(".").pop();
    ext = ext.toLowerCase();

    switch (ext) {
        case "png":
        case "jpeg":
        case "jpg":
            return true;
        default:
            Swal.fire({
                position: "center",
                icon: "error",
                text: "Archivo no permitido",
                showConfirmButton: false,
                timer: 1500,
            });
            file.value = "";
            file.files[0] = "";
            return false;
    }
};

var ViewAlers = () => {
    if (localStorage.getItem("a")) {
        let value = JSON.parse(localStorage.getItem("a"));
        switch (value.status) {
            case 1:
                Swal.fire({
                    position: "center",
                    icon: "success",
                    text: value.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                localStorage.removeItem("a");
                break;
            case 2:
                Swal.fire({
                    position: "center",
                    icon: "success",
                    text: value.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                localStorage.removeItem("a");
        }
    }
};

$("#dataForm").submit(function(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    let title = $("#title").val();
    let content = $("#content").val();
    let img = $("#img")[0].files[0];

    formData.append("title", title);
    formData.append("content", content);
    getBase64FromFile(img, function(base64) {
        formData.append("imgBase64", base64);
    });

    fetch("https://localhost:44398/api/posts/CreatePost", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: formData,
        })
        .then((response) => response.json())
        .then((json) => {
            $("#alert").html("");
            const obj = {
                status: 2,
                message: json.message,
            };
            if (json.status == true) {
                localStorage.setItem("a", JSON.stringify(obj));
                window.location = "home.html";
            } else if (json.status == false) {
                Swal.fire({
                    position: "center",
                    icon: "error",
                    text: json.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
});

$("#dataFormSearch").submit(function(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    let title = $("#titleS").val();
    let content = $("#contentS").val();


    if (title == "" && content == "") {
        GetPosts(0);
    } else {
        formData.append("title", title);
        formData.append("content", content);
        const objSearch = {
            "title": title,
            "content": content
        }
        GetPosts(0, objSearch);
    }

    $("#modalSearchPost").modal("hide");
});

function getBase64FromFile(img, callback) {
    let fileReader = new FileReader();
    fileReader.addEventListener("load", function(evt) {
        callback(fileReader.result);
    });
    fileReader.readAsDataURL(img);
}

var GetPosts = (pag, search) => {
    var formData = new FormData();
    formData.append("pag", pag);
    if (search != undefined) {
        formData.append("search", JSON.stringify(search))
    }
    fetch("https://localhost:44398/api/posts/GetPosts", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: formData,
        })
        .then((response) => response.json())
        .then((json) => {
            $("#msgPosts").html("");
            if (json.messageId == 0 && json.object == null && json.status == false) {
                $("#posts").hide();
                $("#nextBtn").hide();
                $("#backBtn").hide();
                $("#msgPosts").append(
                    `<div class="col-md-12 text-center mt-5">${json.message}</div>`
                );
            } else {
                $("#Spinner").show();
                $("#posts").show();
                let dataPost = document.querySelector("#dataPosts");
                dataPost.innerHTML = "";
                json.object.forEach((element) => {
                    dataPost.innerHTML += `
                            <tr>
                                <th scope="row">${element.title}</th>
                                <td>${element.content}</td>
                                <td><img src="data:image/${element.Ext};base64,${element.bytesImg}" style="width: 100px"></td>
                                <td><button class="btn btn-danger" onclick="deleteObj(${element.idPost})"><i class="bx bx-trash"></i></button></td>
                            </tr>
                `;
                });

                $("#num").val(json.countPage)
                if (json.count > 10) {
                    $("#nextBtn").show();
                } else {
                    $("#nextBtn").hide();
                }
                if (json.countPage < 10) {
                    $("#nextBtn").hide();
                } else {
                    $("#nextBtn").show();
                }
                $("#Spinner").hide();
            }
        })
        .catch((response) => {
            console.log(response);
            // window.location = "index.html";
        });
};

$("#btnNewPost").click(function() {
    $("#modalNewPost").modal("show");
});

$("#modalNewPost").on("hidden.bs.modal", function() {
    document.getElementById("dataForm").reset();
    $("#img")
        .siblings(".custom-file-label")
        .removeClass("selected")
        .html("Selecciona un imagen..");
});

$("#btnSearchPost").click(function() {
    $("#modalSearchPost").modal("show");
});

$("#modalSearchPost").on("hidden.bs.modal", function() {
    document.getElementById("dataFormSearch").reset();
});



var logout = () => {
    localStorage.removeItem("token");
    window.location = "/index.html";
};

var GetPaginators = () => {
    if (!localStorage.getItem("pagination")) {
        const pagination = {
            back: 0,
        };
        localStorage.setItem("pagination", JSON.stringify(pagination));
    } else {
        var obj = JSON.parse(localStorage.getItem("pagination"));
        if (obj.back == 0) {
            $("#backBtn").hide();
        } else {
            $("#backBtn").show();
        }
    }
};

$("#nextBtn").click(function() {
    var obj = JSON.parse(localStorage.getItem("pagination"));
    if (obj.back == 0) {
        var obj = {
            back: 10,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(10);
    } else if (obj.back == 10) {
        var obj = {
            back: 20,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(20);
    } else if (obj.back == 20) {
        var obj = {
            back: 30,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(30);
    } else if (obj.back == 30) {
        var obj = {
            back: 40,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(40);
    } else if (obj.back == 40) {
        var obj = {
            back: 50,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(60);
    } else if (obj.back == 50) {
        var obj = {
            back: 60,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(70);
    } else if (obj.back == 60) {
        var obj = {
            back: 70,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(80);
    } else if (obj.back == 70) {
        var obj = {
            back: 80,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(90);
    }
});

$("#backBtn").click(function() {
    var obj = JSON.parse(localStorage.getItem("pagination"));
    let prev = obj.back - 10;
    if (prev < 0) {
        prev = 0;
    }
    if (prev == 0) {
        var obj = {
            back: 0,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(0);
    } else if (prev == 10) {
        var obj = {
            back: 10,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(10);
    } else if (prev == 20) {
        var obj = {
            back: 20,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(20);
    } else if (prev == 30) {
        var obj = {
            back: 30,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(30);
    } else if (prev == 40) {
        var obj = {
            back: 40,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(40);
    } else if (prev == 50) {
        var obj = {
            back: 50,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(50);
    } else if (prev == 60) {
        var obj = {
            back: 60,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(60);
    } else if (prev == 70) {
        var obj = {
            back: 70,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(70);
    } else if (prev == 80) {
        var obj = {
            back: 80,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(80);
    } else if (prev == 90) {
        var obj = {
            back: 90,
        };
        localStorage.removeItem("pagination");
        localStorage.setItem("pagination", JSON.stringify(obj));
        GetPosts(90);
    }
});

var deleteObj = (id) => {
    Swal.fire({
        title: "",
        text: "¿Estás seguro que deseas eliminar este post?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E8B57",
        cancelButtonColor: "#DC143C",
        confirmButtonText: "Si",
        cancelButtonText: "No",
    }).then((result) => {
        if (result.value) {
            var formData = new FormData();
            formData.append("id", id);
            fetch("https://localhost:44398/api/posts/DeletePost", {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                    body: formData,
                })
                .then((response) => response.json())
                .then((json) => {
                    if (json.status == true) {
                        const obj = {
                            status: 1,
                            message: json.message,
                        };
                        localStorage.setItem("a", JSON.stringify(obj));
                        window.location = "home.html";
                    }
                });
        }
    });

};