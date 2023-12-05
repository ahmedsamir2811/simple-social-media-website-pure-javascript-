const baseUrl = 'https://tarmeezacademy.com/api/v1'
const posts = document.getElementById("posts")

{
    fetch(`${baseUrl}/posts?limit=10`)
        .then(res => res.json())
        .then(res => {
            const response = res.data
            posts.innerHTML = ''
            response.forEach(post => {
                console.log(post);
                getPosts(post)
                setupUI()
            });
        }).catch(err => console.log(err))


    //Generates a HTML content for a post and appends it to the 'posts' element.

    const getPosts = (post) => {
        const author = post.author
        let postTitle = ""
        if (postTitle != null) {
            postTitle = post.title
        }

        let content = `
    <div class="cart">
        <div class="head">
            <a href=""> <img class="image-1" src=${author.profile_image} alt=""> </a>
            <h6>${author.username}</h6>
        </div>
        <div class="content">
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
            showAlert("logged in successfully")
            setupUI()
        })
        .catch(error => {
            console.error(); ('Error:', error);
        });
}

const setupUI = () => {
    const token = localStorage.getItem("token");
    const loginDiv = document.getElementById("logged-in-div");
    const logoutDiv = document.getElementById("logout-div");
    if (token == null) {
        loginDiv.style.setProperty("display", "flex", "important");
        logoutDiv.style.setProperty("display", "none", "important");
    } else {
        loginDiv.style.setProperty("display", "none", "important");
        logoutDiv.style.setProperty("display", "flex", "important");
    }
};


const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("logged out successfully")
    setupUI()
}

const showAlert = (customMessage) => {
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

    appendAlert(customMessage, 'success')

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#success-alert')
        // alert.close()
    }, 3000);

}
