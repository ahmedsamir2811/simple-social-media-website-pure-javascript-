const baseUrl = 'https://tarmeezacademy.com/api/v1'
const posts = document.getElementById("posts")

let currentPage = 1
let lastPage = 1

//Function to handle pagination when scrolling to the end of the page
const pagination = () => {
    // Add scroll event listener to the window
    window.addEventListener("scroll", () => {
        // Check if scrolled to the end of the page
        const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight

        // Check if there are more pages to load
        if (endOfPage && currentPage < lastPage) {
            // Increment the current page number
            currentPage = currentPage + 1

            // Call the getData function to fetch data for the next page
            getData(false, currentPage)
        }
    })
}

pagination()

//Fetches data from the API and renders the posts on the page.
const getData = (reload = true, page = 1) => {
    const url = `${baseUrl}/posts?limit=5&page=${page}`;

    // Fetch data from the API
    fetch(url)
        .then(res => res.json())
        .then(res => {
            const response = res.data;

            lastPage = res.meta.last_page;

            if (reload) {
                posts.innerHTML = '';
            }

            // Render each post
            response.forEach(post => {
                getPosts(post);
                setupUI();
            });
        })
        .catch(err => console.log(err));

    //Renders a single post on the page.
    const getPosts = (post) => {
        const author = post.author;
        let postTitle = '';

        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editBtnContent = '';
        if (isMyPost) {
            editBtnContent = `
                <div>
                    <button type="button" class="btn btn-secondary end" onclick="editPostEditClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>
                    <button type="button" class="btn btn-danger end" onclick="deletePostEditClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>
                </div>
            `;
        }
        if (postTitle != null) {
            postTitle = post.title;
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
                <div class="content" onclick="postClicked(${post.id})" style="cursor:pointer;">
                    <div class="image">
                        <img class="image-2" src=${post.image} alt="">
                    </div>
                    <div class="post">
                        <h6>${post.created_at}</h6>
                        <h5>${postTitle}</h5>
                        <p>${post.body}</p>
                    </div>
                    <hr>
                    <div class="comments">
                        <i class="fa-solid fa-pencil"></i>
                        <h6><span>(${post.comments_count})</span>comments</h6>
                        <span id="post-tags-${post.id}">
                            ${post.tags.map(tag => `
                                <span class="btn btn-sm rounded-5">${tag.name}</span>`).join('')}
                        </span>
                    </div>
                </div>
            </div>
        `;

        posts.innerHTML += content;
    }
}

//Handle the click event of the login button.
const loginBtnClicked = () => {
    // Get the username and password from input fields
    const userName = document.getElementById("username-input").value;
    const password = document.getElementById("password-input").value;

    // Log the username and password
    console.log(userName, password);

    // Prepare the parameters for the POST request
    const params = {
        username: userName,
        password: password
    };

    // Prepare the request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    };

    // Send the POST request to the login API
    const url = `${baseUrl}/login`;
    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            console.log('Response:', res);

            // Store the token and user in local storage
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            // Hide the login modal
            const model = document.getElementById("login-model");
            const modelInstance = bootstrap.Modal.getInstance(model);
            modelInstance.hide();

            // Show success message and update the UI
            showAlert("logged in successfully", "success");
            setupUI();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//Deletes a post from the server and performs additional actions.
const confirmPostDelete = (postId) => {
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
            // Hide the delete post modal
            const model = document.getElementById("delete-post-model");
            const modelInstance = bootstrap.Modal.getInstance(model);
            modelInstance.hide();

            // Show success alert
            showAlert("The Post Has Been Deleted Successfully", "success");

            // Refresh data to reflect changes
            getData();

            console.log(res);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

//Handle the click event of the register button
const registerBtnClicked = () => {
    // Get the input values from the register form
    const registerName = document.getElementById("register-name-input").value;
    const registerUserName = document.getElementById("register-username-input").value;
    const registerPassword = document.getElementById("register-password-input").value;
    const registerImage = document.getElementById("register-image-input").files[0];

    // Create a new FormData object and append the input values to it
    let formData = new FormData();
    formData.append("name", registerName);
    formData.append("username", registerUserName);
    formData.append("password", registerPassword);
    formData.append("image", registerImage);

    // Set the request options for the fetch request
    const requestOptions = {
        method: 'POST',
        body: formData
    };

    // Construct the URL for the register API endpoint
    const url = `${baseUrl}/register`;

    // Send the fetch request to the register API endpoint
    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            console.log('Response:', res);

            // Store the token and user details in the local storage
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            // Hide the register modal and show a success alert
            const model = document.getElementById("register-model");
            const modelInstance = bootstrap.Modal.getInstance(model);
            modelInstance.hide();
            showAlert("New User Registered Successfully", "success");

            // Set up the user interface
            setupUI();
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

//Handles the click event when creating a new post.
const createNewPostClicked = () => {
    // Initialize variables
    let url = ``;
    const token = localStorage.getItem("token");

    // Get the post ID input value
    let postId = document.getElementById("post-id-input").value;

    // Check if creating a new post or updating an existing one
    let isCreate = postId == null || postId == "";

    // Get values from input fields
    const title = document.getElementById("post-title-input").value;
    const body = document.getElementById("post-body-input").value;
    const image = document.getElementById("post-image-input").files[0];

    // Create form data
    let formData = new FormData();
    formData.append("body", body);
    formData.append("title", title);
    formData.append("image", image);

    // Set request options
    let requestOptions = {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`
        },
        body: formData
    };

    // Determine the URL based on whether it's a create or update request
    if (isCreate) {
        url = `${baseUrl}/posts`;
    } else {
        url = `${baseUrl}/posts/${postId}`;
        formData.append("_method", "put");
    }

    // Send the request
    fetch(url, requestOptions)
        .then(res => res.json())
        .then(res => {
            // Hide the create post modal
            const model = document.getElementById("create-post-model");
            const modelInstance = bootstrap.Modal.getInstance(model);
            modelInstance.hide();

            // Show success alert
            showAlert("New Post Has Been Created", "success");

            // Refresh data
            getData();

            console.log(res);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//Set up the user interface based on the user's authentication status.
const setupUI = () => {
    // Get the authentication token from local storage
    const token = localStorage.getItem("token");

    // Get the necessary DOM elements
    const loginDiv = document.getElementById("logged-in-div");
    const logoutDiv = document.getElementById("logout-div");
    const addBtn = document.getElementById("add-btn");
    const navUser = document.getElementById("nav-username");
    const navUserImage = document.getElementById("nav-user-image");

    // If the token is null, the user is not logged in
    if (token == null) {
        // Hide the add button
        if (addBtn != null) {
            addBtn.style.setProperty("display", "none", "important");
        }
        // Show the login div and hide the logout div
        loginDiv.style.setProperty("display", "flex", "important");
        logoutDiv.style.setProperty("display", "none", "important");
    } else {
        // Show the add button
        if (addBtn != null) {
            addBtn.style.setProperty("display", "block", "important");
        }
        // Hide the login div and show the logout div
        loginDiv.style.setProperty("display", "none", "important");
        logoutDiv.style.setProperty("display", "flex", "important");

        // Get the current user's information
        const user = getCurrentUser();

        // Set the username and profile image in the navigation bar
        navUser.innerHTML = user.username;
        navUserImage.src = user.profile_image;
    }
};

// Retrieve the current user from local storage
const getCurrentUser = () => {
    let user = null;

    // Check if there is a user stored in local storage
    const storageUser = localStorage.getItem("user");
    if (storageUser != null) {
        // Parse the stored user object
        user = JSON.parse(storageUser);
    }

    // Return the current user
    return user;
}

/**
 * Removes the token and user from local storage, logs out the user,
 * shows a success message, and sets up the user interface.
 */
const logout = () => {
    // Remove the token and user from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Show a success message
    showAlert("logged out successfully", "success");

    // Set up the user interface
    setupUI();
};

//Show an alert message on the page.
const showAlert = (customMessage, type = "success") => {
    // Get the placeholder element where the alert will be appended
    const alertPlaceholder = document.getElementById('success-alert');

    //Append the alert to the placeholder element.
    const appendAlert = (message, type) => {
        // Create a wrapper element and set its inner HTML
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        // Append the wrapper element to the alert placeholder
        alertPlaceholder.append(wrapper);
    }

    // Append the custom message and type to the alert placeholder
    appendAlert(customMessage, type);

    setTimeout(() => {
        // Get the instance of the success-alert element using Bootstrap's Alert class
        const alert = bootstrap.Alert.getOrCreateInstance('#success-alert');
        // Close the alert after 3000 milliseconds
        // alert.close();
    }, 3000);
}

//Redirects the user to the post details page
const postClicked = (postId) => {
    // Construct the URL with the postId parameter
    const url = `post-details.html?postId=${postId}`;

    // Redirect the user to the post details page
    window.location = url;
};

const urlParams = new URLSearchParams(window.location.search)
const id = urlParams.get("postId")

//Fetches the details of a post from the API and renders them on the page.
const getPostDetails = () => {
    // Fetch the post details from the API
    fetch(`${baseUrl}/posts/${id}`)
        .then(res => res.json())
        .then(res => {
            const post = res.data;
            const comments = post.comments;
            const author = post.author;

            // Render the author's username
            document.getElementById("username-span").innerHTML = author.username;
            document.getElementById("post-details").innerHTML = '';

            // Generate the HTML for the post details
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
        `;

            // Render the post details on the page
            document.getElementById("post-details").innerHTML = postContent;
        })
        .catch(err => console.log(err));
};

//Handles the event when the create comment button is clicked.
const createCommentClicked = () => {
    // Get the comment body from the input field
    let commentBody = document.getElementById("comment-input").value;

    // Get the token from local storage
    let token = localStorage.getItem("token");

    // Set the URL for the API endpoint
    let url = `${baseUrl}/posts/${id}/comments`;

    // Set the parameters for the API request
    const params = {
        body: commentBody,
    };

    // Set the request options for the API request
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    };

    // Send the API request to create a comment
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Refresh the post details after creating the comment
            getPostDetails();
        })
        .catch(error => {
            console.error('Error creating comment:', error);
        });
};

//Function to handle the edit button click for a post.
const editPostEditClicked = (postObject) => {
    // Parse the JSON string to get the post object
    let post = JSON.parse(decodeURIComponent(postObject));

    // Update the submit button text
    document.getElementById("post-modal-submit-btn").innerHTML = "Update";

    // Set the post id input value
    document.getElementById("post-id-input").value = post.id;

    // Update the post modal title
    document.getElementById("post-model-title").innerHTML = "Edit Post";

    // Set the post title input value
    document.getElementById("post-title-input").value = post.title;

    // Set the post body input value
    document.getElementById("post-body-input").value = post.body;

    // Create a new bootstrap modal and toggle it
    let postModel = new bootstrap.Modal(document.getElementById("create-post-model"), {});
    postModel.toggle();
}

//Function to handle the delete post edit event
const deletePostEditClicked = (postObject) => {
    // Decode the post object string
    let post = JSON.parse(decodeURIComponent(postObject));

    // Log the post object
    console.log(post);

    // Set the value of the delete post id input field
    document.getElementById("delete-post-id-input").value = post.id;

    // Create a new bootstrap modal for the delete post model
    let postModel = new bootstrap.Modal(document.getElementById("delete-post-model"), {});

    // Toggle the post model
    postModel.toggle();
}

//Handles the click event of the add button.
const addBtnClicked = () => {
    // Set the innerHTML of the submit button to "Create"
    document.getElementById("post-modal-submit-btn").innerHTML = "Create";

    // Clear the value of the post id input
    document.getElementById("post-id-input").value = "";

    // Set the innerHTML of the post model title to "Create A New Post"
    document.getElementById("post-model-title").innerHTML = "Create A New Post";

    // Clear the value of the post title input
    document.getElementById("post-title-input").value = "";

    // Clear the value of the post body input
    document.getElementById("post-body-input").value = "";

    // Create a new bootstrap modal and toggle it
    let postModel = new bootstrap.Modal(document.getElementById("create-post-model"), {});
    postModel.toggle();
}

getPostDetails()

getData()

setupUI()



//Get the current user ID from the URL parameters.
//The current user ID, or null if not found.
const getCurrentUserID = () => {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Get the user ID from the URL parameters
    const id = urlParams.get("userId");

    // Return the user ID
    return id;
}

// Fetches user data from the API and updates the UI with the retrieved information
const getUser = () => {
    const id = getCurrentUserID();

    fetch(`${baseUrl}/users/${id}`)
        .then(res => res.json())
        .then(res => {
            const user = res.data;

            // Update user information in the UI
            document.getElementById("main-info-email").innerHTML = user.email;
            document.getElementById("main-info-name").innerHTML = user.name;
            document.getElementById("main-info-username").innerHTML = user.username;
            document.getElementById("header-image").src = user.profile_image;
            document.getElementById("posts-count").innerHTML = user.posts_count;
            document.getElementById("comments-count").innerHTML = user.comments_count;

            console.log(res.data);
        })
        .catch(error => {
            console.error(error);
        });
}

getUser()

//Retrieves the profile posts for the current user.
const getProfilePosts = () => {
    const id = getCurrentUserID()
    let posts = document.getElementById("user-posts")

    fetch(`${baseUrl}/users/${id}/posts`)
        .then(res => res.json())
        .then(res => {
            const response = res.data
            posts.innerHTML = ``
            response.forEach(post => {
                console.log(post);
                getPosts(post)
            });
        }).catch(err => console.log(err))

    //Generates a function comment for the given function body.
    const getPosts = (post) => {
        const author = post.author

        let postTitle = ""

        let user = getCurrentUser()
        let isMyPost = user != null && post.author.id == user.id
        let editBtnContent = ``
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

        document.getElementById("name-profile-posts").innerHTML=`${author.name} -posts-`
        let content = `
<div class="cart shadow">
    <div class="head">
        <div class="head d-flex justify-content-start"> 
        <a href=""> <img class="image-1" src=${author.profile_image} alt=""> </a>
            <h6>${author.username}</h6>
        </div>
        ${editBtnContent}
    </div>
    <div class="content" onclick="postClicked(${post.id})" style="cursor:pointer;">
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

//Redirects the user to the profile page of the specified user ID.
//The ID of the user.
const userClicked = (userId) => {
    // Generate the URL for the profile page using the user ID
    const url = `profile.html?userId=${userId}`;

    // Redirect the user to the profile page
    window.location = url;
}

//Redirects the user to their profile page

const profileClicked = () => {
    // Get the current user
    const user = getCurrentUser();

    // Get the user ID
    const userId = user.id;

    // Redirect the user to their profile page
    window.location = `profile.html?userId=${userId}`;
};
