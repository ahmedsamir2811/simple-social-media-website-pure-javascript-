const baseUrl = 'https://tarmeezacademy.com/api/v1'
const posts = document.getElementById("posts")

let currentPage = 1
let lastPage = 1

const pagination = () => {
    window.addEventListener("scroll", () => {
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight
        console.log(currentPage, lastPage);
        if (endOfPage && currentPage < lastPage) {
            currentPage = currentPage + 1
            getData(false, currentPage)
        }
    })
}

pagination()

const getData = (reload = true, page = 1) => {

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

        let user = getCurrentUser()
        let isMyPost = user != null && post.author.id == user.id
        let editBtnContent =``
        if (isMyPost) {
            editBtnContent = `
            <div>
            <button type="button" class="btn btn-secondary end"  onclick="editPostEditClicked('${encodeURIComponent(JSON.stringify(post))}')" >Edit</button>
            <button type="button" class="btn btn-danger end"  onclick="deletePostEditClicked('${encodeURIComponent(JSON.stringify(post))}')" >Delete</button>
            </div>
            
            `
        }
        if (postTitle != null) {
            postTitle = post.title
        }

        let content = `
    <div class="cart shadow">
        <div class="head">
            <div class="user" onclick="userClicked(${author.id})" style="cursor:pointer;"> 
            <a href=""> <img class="image-1" src=${author.profile_image} alt=""> </a>
                <h6>${author.username}</h6>
            </div>
            ${editBtnContent}
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
            showAlert("logged in successfully", "success")
            setupUI()
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const confirmPostDelete = () => {
    let postId = document.getElementById("delete-post-id-input").value;
    const token = localStorage.getItem("token");

    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };

    const url = `${baseUrl}/posts/${postId}`;


    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            const model = document.getElementById("delete-post-model")
                const modelInstance = bootstrap.Modal.getInstance(model)
                modelInstance.hide()
                showAlert("The Post Has Been Deleted Successfully", "success")
                getData()
                console.log(res);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};


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
    let url = ``;
    const token = localStorage.getItem("token");

    let postId=  document.getElementById("post-id-input").value
    let isCreate = postId == null || postId == ""

    const title = document.getElementById("post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0];

    let formData = new FormData();
    formData.append("body", body);
    formData.append("title", title);
    formData.append("image", image);

    let requestOptions = {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`
        },
        body: formData
    };

    if (isCreate) {
        url = `${baseUrl}/posts`

    }else{
        url = `${baseUrl}/posts/${postId}`

        formData.append("_method", "put");
    }

    fetch(url, requestOptions)
            .then(res => res.json())
            .then(res => {
                const model = document.getElementById("create-post-model")
                const modelInstance = bootstrap.Modal.getInstance(model)
                modelInstance.hide()
                showAlert("New Post Has Been Created", "success")
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
    const addBtn = document.getElementById("add-btn");
    const navUser = document.getElementById("nav-username");
    const navUserImage = document.getElementById("nav-user-image");


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
        navUserImage.src = user.profile_image
    }
};

const getCurrentUser = () => {
    let user = null
    const storageUser = localStorage.getItem("user")
    if (storageUser != null) {
        user = JSON.parse(storageUser)
    }
    return user
}

const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("logged out successfully", "success")
    setupUI()
}

const showAlert = (customMessage, type = "success") => {
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

const getPostDetails = () => {

    fetch(`${baseUrl}/posts/${id}`)
        .then(res => res.json())
        .then(res => {
            const post = res.data
            const comments = post.comments
            const author = post.author
            console.log(author);
            document.getElementById("username-span").innerHTML = author.username
            document.getElementById("post-details").innerHTML = ''

            let postContent = `
    <div class="cart shadow">
        <div class="head d-flex justify-content-start">
            <a href=""> <img class="image-1" src=${author.profile_image} alt=""> </a>
            <h6>${author.username}</h6>
        </div>
        <div class="content">
            <div class="image">
                <img  class="image-2" src=${post.image} alt="">
            </div>
            <div class="post">
                <h6>${post.created_at}</h6>
                <p>${post.body}
                </p>
            </div>
            <hr>
            <div class="comments">
                <i class="fa-solid fa-pencil"></i>
                <h6> <span>(${post.comments_count})</span>comments</h6>
            </div>
        </div>
        <hr>
        <div class="comments cards ">
        ${comments.map(comment => `
        <div class="p-3" style="background-color: rgb(235, 235, 235);">
            <div class=" d-flex justify-content-start ">
                <img src=${comment.author.profile_image} class="rounded-circle"
                    width="30" height="30" alt="" >
                <h6 class="ms-2">
                    ${comment.author.username}
                </h6>
            </div>
            <div style="font-size: 15px;">
                    ${comment.body}
            </div>
        </div>
        `)}
        <hr>
        <div class="input-group mb-5 pb-3" id="add-comment-div">
            <input id="comment-input" type="text" placeholder="add your comment here.." class="form-control">
            <button class="btn btn-outline-primary" type="button" onclick="createCommentClicked()">send</button>
        </div>
        </div>
    </div>
        `
            document.getElementById("post-details").innerHTML = postContent
        }).catch(err => console.log(err))
}

const createCommentClicked = () => {
    let commentBody = document.getElementById("comment-input").value;

    let token = localStorage.getItem("token");
    let url = `${baseUrl}/posts/${id}/comments`;

    const params = {
        body: commentBody,
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    };

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            getPostDetails();
        })
        .catch(error => {
            console.error('Error creating comment:', error);
        });
};

const editPostEditClicked = (postObject) => {
    let post =JSON.parse(decodeURIComponent(postObject))

    document.getElementById("post-modal-submit-btn").innerHTML="Update" 
    document.getElementById("post-id-input").value= post.id
    document.getElementById("post-model-title").innerHTML="Edit Post"
    document.getElementById("post-title-input").value=post.title
    document.getElementById("post-body-input").value=post.body
    let postModel = new bootstrap.Modal(document.getElementById("create-post-model"),{})
    postModel.toggle()
}

const deletePostEditClicked = (postObject) => {
    let post =JSON.parse(decodeURIComponent(postObject))
    console.log(post);
    document.getElementById("delete-post-id-input").value = post.id
    let postModel = new bootstrap.Modal(document.getElementById("delete-post-model"),{})
    postModel.toggle()
}

const addBtnClicked = () => {
    document.getElementById("post-modal-submit-btn").innerHTML="Create" 
    document.getElementById("post-id-input").value= ""
    document.getElementById("post-model-title").innerHTML="Create A New Post"
    document.getElementById("post-title-input").value=""
    document.getElementById("post-body-input").value=''
    let postModel = new bootstrap.Modal(document.getElementById("create-post-model"),{})
    postModel.toggle()
}

getPostDetails()

getData()

setupUI()


const getCurrentUserID = () => {  
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("userId")
    return id
}

const getUser = () => {  
    const id = getCurrentUserID()
    fetch(`${baseUrl}/users/${id}`)
    .then(res=>res.json())
    .then(res=>{
        const user = res.data
        document.getElementById("main-info-email").innerHTML=user.email
        document.getElementById("main-info-name").innerHTML=user.name
        document.getElementById("main-info-username").innerHTML=user.username
        document.getElementById("header-image").src=user.profile_image
        document.getElementById("posts-count").innerHTML=user.posts_count
        document.getElementById("comments-count").innerHTML=user.comments_count
        console.log(res.data);
    }).catch(error=>{
        console.error(error);
    })
}

getUser()

const getProfilePosts = () => {
    const id = getCurrentUserID()
    let posts =document.getElementById("user-posts")

    fetch(`${baseUrl}/users/${id}/posts`)
    .then(res => res.json())
    .then(res => {
        const response = res.data
        posts.innerHTML =``
        response.forEach(post => {
            console.log(post);
            getPosts(post)
        });
    }).catch(err => console.log(err))


const getPosts = (post) => {
    const author = post.author

    let postTitle = ""

    let user = getCurrentUser()
    let isMyPost = user != null && post.author.id == user.id
    let editBtnContent =``
    if (isMyPost) {
        editBtnContent = `
        <div>
        <button type="button" class="btn btn-secondary end"  onclick="editPostEditClicked('${encodeURIComponent(JSON.stringify(post))}')" >Edit</button>
        <button type="button" class="btn btn-danger end"  onclick="deletePostEditClicked('${encodeURIComponent(JSON.stringify(post))}')" >Delete</button>
        </div>
        
        `
    }
    if (postTitle != null) {
        postTitle = post.title
    }


    let content = `
<div class="cart shadow">
    <div class="head">
        <div class="head d-flex justify-content-start"> 
        <a href=""> <img class="image-1" src=${author.profile_image} alt=""> </a>
            <h6>${author.username}</h6>
        </div>
        ${editBtnContent}
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
            
        </div>
    </div>
</div>
`
    posts.innerHTML += content

}
}

getProfilePosts()


const userClicked = (userId) => { 
    window.location = `profile.html?userId=${userId}`
}

const profileClicked = () => {  
    const user = getCurrentUser()
    const userId = user.id
    window.location = `profile.html?userId=${userId}`
}