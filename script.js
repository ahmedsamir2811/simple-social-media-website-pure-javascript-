const baseUrl = 'https://tarmeezacademy.com/api/v1'
const posts = document.getElementById("posts")

let currentPage = 1
let lastPage = 1

const pagination = () => {
    window.addEventListener("scroll",() => {
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight
    console.log(currentPage , lastPage);
        if (endOfPage && currentPage < lastPage) {
            currentPage = currentPage + 1 
            getData(false , currentPage)
        }
    })
}

pagination()

const getData = (reload = true , page = 1) => { 

    fetch(`${baseUrl}/posts?limit=10&page=${page}`)
    .then(res => res.json())
    .then(res => {
        const response = res.data

        lastPage = res.meta.last_page

        if (reload) {
            posts.innerHTML = ''
        }

        response.forEach(post => {
            console.log(post);
            getPosts(post)
            setupUI()
        });
    }).catch(err => console.log(err))


    const getPosts = (post) => {
        const author = post.author
        let postTitle = ""
        if (postTitle != null) {
            postTitle = post.title
        }

        let content = `
    <div class="cart shadow">
        <div class="head">
            <a href=""> <img class="image-1" src=${author.profile_image} alt=""> </a>
            <h6>${author.username}</h6>
        </div>
        <div class="content" onclick="postClicked(${post.id})">
            <div class="image">
                <img  class="image-2" src=${post.image} alt="">
            </div>
            <div class="post">
                <h6>${post.created_at}</h6>
                <h5>${postTitle}</h5>
                <p>${post.body}
                </p>
            </div>
            <hr>
            <div class="comments">
                <i class="fa-solid fa-pencil"></i>
                <h6> <span>(${post.comments_count})</span>comments</h6>
                <span id="post-tags-${post.id}">
                    ${post.tags.map(tag => `
                    <span class="btn btn-sm rounded-5">${tag.name}</span>`).join('')}
                </span>
            </div>
        </div>
    </div>
    `
        posts.innerHTML += content

    }
    
}

const loginBtnClicked = () => {
    const userName = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;

    console.log(userName, password);
    const params = {
        username: userName,
        password: password
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    };

    const url = `${baseUrl}/login`

    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            console.log('Response:', res);

            localStorage.setItem("token", res.token)
            localStorage.setItem("user", JSON.stringify(res.user))

            const model = document.getElementById("login-model")
            const modelInstance = bootstrap.Modal.getInstance(model)
            modelInstance.hide()
            showAlert("logged in successfully","success")
            setupUI()
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const registerBtnClicked = () => {
    const registerName = document.getElementById("register-name-input").value;
    const registerUserName = document.getElementById("register-username-input").value;
    const registerPassword = document.getElementById("register-password-input").value;
    const registerImage = document.getElementById("register-image-input").files[0];

    let formData = new FormData();
    formData.append("name", registerName);
    formData.append("username", registerUserName);
    formData.append("password", registerPassword);
    formData.append("image", registerImage);

    const requestOptions = {
        method: 'POST',
        body: formData
    };

    const url = `${baseUrl}/register`;

    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            console.log('Response:', res);

            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            const model = document.getElementById("register-model");
            const modelInstance = bootstrap.Modal.getInstance(model);
            modelInstance.hide();
            showAlert("New User Registered Successfully", "success");
            setupUI();
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

const createNewPostClicked = () => {
    const url = `${baseUrl}/posts`;
    const token = localStorage.getItem("token");

    const title = document.getElementById("post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0];
    
    let formData = new FormData();
    formData.append("body", body);
    formData.append("title", title);
    formData.append("image", image);

    const requestOptions = {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`
        },
        body: formData
    };

    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            const model = document.getElementById("create-post-model")
            const modelInstance = bootstrap.Modal.getInstance(model)
            modelInstance.hide()
            showAlert("New Post Has Been Created","success")
            getData()
            console.log(res);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const setupUI = () => {
    const token = localStorage.getItem("token");

    const loginDiv = document.getElementById("logged-in-div");
    const logoutDiv = document.getElementById("logout-div");
    const addBtn = document.getElementById("add-btn") ;
    const navUser = document.getElementById("nav-username") ;
    const navUserImage = document.getElementById("nav-user-image") ;


    if (token == null) {
        if (addBtn != null) {
            addBtn.style.setProperty("display", "none", "important");
        }
        loginDiv.style.setProperty("display", "flex", "important");
        logoutDiv.style.setProperty("display", "none", "important");
    } else {
        if (addBtn != null) {
            addBtn.style.setProperty("display", "block", "important");
        }
        loginDiv.style.setProperty("display", "none", "important");
        logoutDiv.style.setProperty("display", "flex", "important");

        const user = getCurrentUser()
        navUser.innerHTML = user.username
        navUserImage.src =user.profile_image
    }
};

const getCurrentUser = () => {
    let user =null
    const storageUser = localStorage.getItem("user")
    if (storageUser != null) {
        user = JSON.parse(storageUser)
    }
    return user
}

const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("logged out successfully" , "success")
    setupUI()
}

const showAlert = (customMessage,type="success") => {
    const alertPlaceholder = document.getElementById('success-alert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }

    appendAlert(customMessage, type)

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#success-alert')
        // alert.close()
    }, 3000);

}

const postClicked = (postId) => { 
    window.location = `post-details.html?postId=${postId}`
}

const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get("postId")
console.log(id);

const getPostDetails = () => {
    fetch(`${baseUrl}/posts/${id}`)
    .then(res => res.json())
    .then(res => {
        const post = res.data
        const comments = post.comments
        const author = post.author
        document.getElementById("username-span").innerHTML = author.username
        
    }).catch(err => console.log(err))
}

getPostDetails()



getData()

setupUI()
