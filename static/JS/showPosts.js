// loading post
getPosts();

// get post data
async function getPosts(){
    list.style.pointerEvents = "none";
    showPostsFrame.innerHTML ="";
    showPostsLoading.style.display="flex";
    const response = await fetch(`/api/post?forum=${forumPage}`);
    const data = await response.json();
    showPostsLoading.style.display="none";
    list.style.pointerEvents = "auto";
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;  
    }else if(data.data == null){
        return;
    }else{
        const posts = data.data;
        posts.forEach((post) => {
            let totalComments;
            let totalLikes;
            if(post.postComment == null){
                totalComments = 0;
            }else{
                totalComments = post.postComment.length;
            };
            if(post.postLike == null){
                totalLikes = 0;
            }else{
                totalLikes = post.postLike.length;
            };
            showPost(post, totalLikes, totalComments, post.postLike, post.postComment);
        })
        const nextPostPage = data.nextPostPage;
        if(nextPostPage){
            postPage = nextPostPage;
        }else{
            postPage = null;
        }
        getFollowUpPost();
    }
}

// 完成⾃動載入後續 post 的功能(利⽤ IntersectionObserver 物件)
function getFollowUpPost(){
    const postArticle = document.querySelectorAll(".postArticle");
    const options = {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0.05,
    };
    // 建立觀察器（observer）
    const observer = new IntersectionObserver(callback, options);
    observer.observe(postArticle[postArticle.length - 2]);  // 開始觀察目標(倒數第2篇post)
}

// callback 就是當目標（entry）進入到觀察器的鏡頭（root）內時，要做什麼事的 function
async function callback(entry){
    if(entry[0].isIntersecting){
        // 如果沒有下一頁的話，就不會再去連線取資料
        if (postPage && isLoading == false ){
            isLoading = true;
            list.style.pointerEvents = "none";
            showPostsLoading.style.display="flex";
            const response = await fetch(`/api/post?forum=${forumPage}&postPage=${postPage}`);
            const data = await response.json();
            showPostsLoading.style.display="none";
            list.style.pointerEvents = "auto";
            if(data.error == true){
                noticeWindow.style.display="block";
                noticeMain.textContent = data.message;  
            }else if(data.data == null){
                return;
            }else{
                const posts = data.data;
                posts.forEach((post) => {
                    let totalComments;
                    let totalLikes;
                    if(post.postComment == null){
                        totalComments = 0;
                    }else{
                        totalComments = post.postComment.length;
                    };
                    if(post.postLike == null){
                        totalLikes = 0;
                    }else{
                        totalLikes = post.postLike.length;
                    };
                    showPost(post, totalLikes, totalComments, post.postLike, post.postComment);
                })
                const nextPostPage = data.nextPostPage;
                if(nextPostPage){
                    postPage = nextPostPage;
                }else{
                    postPage = null;
                }
                getFollowUpPost();
            }
            isLoading = false;
        }
    }
}

// show post
function showPost(postInfos, totalLikes, totalComments, totalLikesInfo, totalCommentsInfo){
    const nowUserID = postInfos.userID;
    const postID = postInfos.postID;
    const postUserAvatar = postInfos.postUserAvatar;
    const postArticle = document.createElement("div");
    postArticle.setAttribute("class","postArticle");
    /*------------------------poster------------------------*/ 
    const poster = document.createElement("div");
    poster.setAttribute("class", "poster");
    
    const posterForum = document.createElement("div");
    posterForum.setAttribute("class", "posterForum");
    posterForum.textContent = postInfos.postForum;
    
    const posterSection = document.createElement("div");
    posterSection.setAttribute("class", "posterSection");
    
    const posterAvatar = document.createElement("div");
    posterAvatar.setAttribute("class", "posterAvatar");
    const posterAvatarImg = document.createElement("img");
    if(postUserAvatar){
        posterAvatarImg.setAttribute("src", postUserAvatar);
    }else{
        posterAvatarImg.setAttribute("src", "/Images/avatar.png");
    }
    posterAvatar.appendChild(posterAvatarImg);
    
    const posterInfo = document.createElement("div");
    posterInfo.setAttribute("class", "posterInfo");
    
    const posterUserName = document.createElement("div");
    posterUserName.setAttribute("class", "posterUserName");
    posterUserName.textContent = postInfos.postUserName;
    posterInfo.appendChild(posterUserName);
    if(postInfos.postLocation){
        const posterLocation = document.createElement("div");
        posterLocation.setAttribute("class", "posterLocation");
        const posterLocationLink = document.createElement("a");
        posterLocationLink.setAttribute("class", "posterLocationLink"); 
        posterLocationLink.setAttribute("href", `https://www.google.com/maps/search/?api=1&query=${postInfos.postLocation}&query_place_id=${postLocationPlaceID}`);       
        posterLocationLink.setAttribute("target", "_blank");
        const posterLocationImg = document.createElement("img");
        posterLocationImg.setAttribute("src", "/Images/place.png");
        const posterLocationName = document.createElement("div");
        posterLocationName.setAttribute("class", "posterLocationName");
        posterLocationName.textContent = postInfos.postLocation;
        posterLocationLink.appendChild(posterLocationImg);
        posterLocationLink.appendChild(posterLocationName);
        posterLocation.appendChild(posterLocationLink);
        posterInfo.appendChild(posterLocation);
    }
    const posterTimeCalculate = timeCalculate(postInfos.postDateIime);
    const posterTime = document.createElement("div");
    posterTime.setAttribute("class", "posterTime");
    posterTime.textContent = posterTimeCalculate;
    posterInfo.appendChild(posterTime);
    
    posterSection.appendChild(posterAvatar);
    posterSection.appendChild(posterInfo);

    poster.appendChild(posterForum);
    poster.appendChild(posterSection);

    if(nowUserID == postInfos.postUserID){
        const deletePost = document.createElement("div");
        deletePost.setAttribute("class", "deletePost");
        const deletePostImg = document.createElement("img");
        deletePostImg.setAttribute("src", "/Images/delete.png");
        deletePost.appendChild(deletePostImg);
        poster.appendChild(deletePost);
        deleteUserPost(postArticle, deletePost, postID);
    }

    postArticle.appendChild(poster);
    /*-------------------postText-------------------------*/ 
    const contentText = document.createElement("div");
    contentText.setAttribute("class", "contentText");
    if(/\n/.test(postInfos.postText)){
        contentText.innerHTML = postInfos.postText.replace(/\n/g, "<br>");
    }else{
        contentText.textContent = postInfos.postText; 
    }
    postArticle.appendChild(contentText);
    /*-------------------postPhoto------------------------*/ 
    if(postInfos.postPhoto){
        const contentRegion = document.createElement("div");
        contentRegion.setAttribute("class", "contentRegion");
        for(let i=0 ; i < postInfos.postPhoto.length ; i++){
            const contentPhoto = document.createElement("div");
            contentPhoto.setAttribute("class", "contentPhoto"); 
            const contentPhotoImg = document.createElement("img");
            contentPhotoImg.setAttribute("src", postInfos.postPhoto[i].photo);   
            contentPhoto.appendChild(contentPhotoImg);
            contentRegion.appendChild(contentPhoto);
            contentPhoto.addEventListener("click", () => {
                contentPhotoEnlarge.src = postInfos.postPhoto[i].photo;
                noticeWindow.style.display = "block";
                noticeSection.style.display = "none";
                contentPhotoEnlargeFrame.style.display = "block";
            })
        }
        postArticle.appendChild(contentRegion);
    }
    showPostInteractBlock(postArticle, postID, totalLikes, totalComments, totalLikesInfo, totalCommentsInfo);
};

function showPostInteractBlock(postArticle, postID, totalLikes, totalComments, totalLikesInfo, totalCommentsInfo){
    /*------------------otherPostFunction--------------------*/    
    const otherPostFunction = document.createElement("div");
    otherPostFunction.setAttribute("class", "otherPostFunction");
    /*------------------totalLikesComments--------------------*/ 
    const totalLikesComments = document.createElement("div");
    totalLikesComments.setAttribute("class", "totalLikesComments");

    const totalLikesAmount = document.createElement("span");
    totalLikesAmount.setAttribute("class", "totalLikesAmount");
    const totalLikesImg = document.createElement("img");
    totalLikesImg.setAttribute("src", "/Images/allLikes.png");
    totalLikesAmount.appendChild(totalLikesImg);
    const totalLikesText = document.createElement("span");
    if(totalLikes < 2 ){
        totalLikesText.textContent = totalLikes + " Like";     
    }else{
        totalLikesText.textContent = totalLikes + " Likes";
    }
    totalLikesAmount.appendChild(totalLikesText);

    totalLikesAmount.addEventListener("click", () => {
        showPostLikeList(totalLikes, totalLikesInfo);
        noticeWindow.style.display = "block";
        noticeSection.style.display = "none";
        postLikeFrame.style.display = "block";
    })

    const totalCommentsAmount = document.createElement("span");
    totalCommentsAmount.setAttribute("class", "totalCommentsAmount");
    if(totalComments <  2 ){
        totalCommentsAmount.textContent = totalComments + " Comment";
        if(totalComments == 0){
            totalCommentsAmount.style.pointerEvents = "none";
        }     
    }else{
        totalCommentsAmount.textContent = totalComments + " Comments"; 
    }
    totalLikesComments.appendChild(totalLikesAmount);
    totalLikesComments.appendChild(totalCommentsAmount);
    /*------------------interact--------------------*/ 
    const interact = document.createElement("div");
    interact.setAttribute("class", "interact");

    const like = document.createElement("div");
    like.setAttribute("class", "like");
    const likeImg = document.createElement("img");
    likeImg.setAttribute("src", "/Images/like.png");
    const likeSpan = document.createElement("span");
    likeSpan.textContent = "Like";
    like.appendChild(likeImg);
    like.appendChild(likeSpan);

    let likeStatus = 0 //dislike;
    let likeID;
    if(totalLikes > 0){
        for(let i=0 ; i < totalLikesInfo.length ; i++){
            if(thisUserID == totalLikesInfo[i].postLikeUserID){
                likeImg.src = "/Images/likeAfter.png";
                likeStatus = 1;
                likeID = totalLikesInfo[i].postLikeID;
            }
        }
    }
    updateLikes(postID, like, likeImg, likeStatus, totalLikesText, totalLikesAmount, likeID);
    
    const comment = document.createElement("div");
    comment.setAttribute("class", "comment");
    const commentImg = document.createElement("img");
    commentImg.setAttribute("src", "/Images/comment.png");
    const commentSpan = document.createElement("span");
    commentSpan.textContent = "Comment";
    comment.appendChild(commentImg);
    comment.appendChild(commentSpan);

    interact.appendChild(like);
    interact.appendChild(comment);
    /*------------------commentFrame--------------------*/ 
    const commentFrame = document.createElement("div");
    commentFrame.setAttribute("class", "commentFrame");


    const viewAllComment = document.createElement("div");
    viewAllComment.setAttribute("class", "viewAllComment");
    viewAllComment.textContent = "View All comments";
    commentFrame.appendChild(viewAllComment);

    const allComments = document.createElement("div");
    allComments.setAttribute("class", "allComments");
    commentFrame.appendChild(allComments);

    if(totalComments > 0){
        viewAllComment.style.display="block";
        createAllComments(totalCommentsInfo,  totalCommentsAmount, viewAllComment, allComments, postID);
    }

    const leaveCommentBlock = document.createElement("div");
    leaveCommentBlock.setAttribute("class", "leaveCommentBlock");

    const leaveCommentAvatarImg = document.createElement("img");
    if(userAvatar){
        leaveCommentAvatarImg.setAttribute("src", userAvatar);
    }else{
        leaveCommentAvatarImg.setAttribute("src", "/Images/avatar.png");
    }
    const leaveCommentInput = document.createElement("input");
    leaveCommentInput.setAttribute("type", "text");
    leaveCommentInput.setAttribute("class", "leaveComment");
    leaveCommentInput.setAttribute("placeholder", "Write a comment");
    leaveCommentInput.setAttribute("autocomplete", "off");

    leaveCommentBlock.appendChild(leaveCommentAvatarImg);
    leaveCommentBlock.appendChild(leaveCommentInput);

    commentFrame.appendChild(leaveCommentBlock);

    otherPostFunction.appendChild(totalLikesComments);
    otherPostFunction.appendChild(interact);
    otherPostFunction.appendChild(commentFrame);

    postArticle.appendChild(otherPostFunction);
    showPostsFrame.appendChild(postArticle);

    comment.addEventListener("click", () => {
        leaveCommentInput.focus();
    })
    addComment(postID, postArticle, viewAllComment, allComments, totalCommentsAmount);
}

function createAllComments(totalCommentsInfo, totalCommentsAmount, viewAllComment, allComments, postID){
    /*-------------------totalComments------------------------*/ 
    for(let i=0 ; i < totalCommentsInfo.length ; i++){
        const oneComment = document.createElement("div");
        oneComment.setAttribute("class", "oneComment");
    
        const commentAvatarImg = document.createElement("img");
        if(totalCommentsInfo[i].postCommentAvatar){
            commentAvatarImg.setAttribute("src", totalCommentsInfo[i].postCommentAvatar);  
        }else{
            commentAvatarImg.setAttribute("src", "/Images/avatar.png");
        }
    
        const userCommentBlock = document.createElement("div");
        userCommentBlock.setAttribute("class", "userCommentBlock");
    
        const commentInfo = document.createElement("div");
        commentInfo.setAttribute("class", "commentInfo");
        commentInfo.textContent = totalCommentsInfo[i].postCommentUserName;
    
        const commentTimeCalculate = timeCalculate(totalCommentsInfo[i].postCommentDateTime);
        const commentTime = document.createElement("span");
        commentTime.setAttribute("class", "commentTime");
        commentTime.textContent = commentTimeCalculate;
        commentInfo.appendChild(commentTime);
    
        const userComment = document.createElement("div");
        userComment.setAttribute("class", "userComment");
        userComment.textContent = totalCommentsInfo[i].commentText;
    
        userCommentBlock.appendChild(commentInfo);
        userCommentBlock.appendChild(userComment);

        oneComment.appendChild(commentAvatarImg);
        oneComment.appendChild(userCommentBlock);

        if(thisUserID == totalCommentsInfo[i].postCommentUserID){
            const commentID = totalCommentsInfo[i].commentID;
            const deleteComment = document.createElement("div");
            deleteComment.setAttribute("class", "deleteComment");
            const deleteCommentImg = document.createElement("img");
            deleteCommentImg.setAttribute("src", "/Images/delete.png");
            deleteComment.appendChild(deleteCommentImg);
            oneComment.appendChild(deleteComment);
            deleteUserComment(postID, commentID, deleteComment, viewAllComment, allComments, totalCommentsAmount);
        }
        allComments.appendChild(oneComment);
    }
    let viewAllCommentStatus = 0 // status = close
    viewAllComment.addEventListener("click", () => {
        if(viewAllCommentStatus == 0){
            allComments.style.display = "flex";
            viewAllComment.textContent = "Hide All comments";
            viewAllCommentStatus = 1;
        }else{
            allComments.style.display = "none";
            viewAllComment.textContent = "View All comments"
            viewAllCommentStatus = 0;     
        }
    })
    totalCommentsAmount.addEventListener("click", () => {
        if(viewAllCommentStatus == 0){
            allComments.style.display = "flex";
            viewAllComment.textContent = "Hide All comments";
            viewAllCommentStatus = 1;
        }else{
            allComments.style.display = "none";
            viewAllComment.textContent = "View All comments"
            viewAllCommentStatus = 0;     
        }
    })
}

// delete post
function deleteUserPost(postArticle, deletePost, postID){
    deletePost.addEventListener("click", () => {
        noticeWindow.style.display = "block";
        noticeSection.style.display = "none";
        deletePostCheckFrame.style.display = "block";
        deletePostCancelButton.addEventListener("click", () => {
            noticeWindow.style.display = "none";
            noticeSection.style.display = "block";
            deletePostCheckFrame.style.display = "none";
        })
        deletePostConfirmButton.addEventListener("click", () => {
            fetch(`/api/post?postID=${postID}`,{
                method:"DELETE",
            }).then(function(response){
                return response.json();  
            }).then(function(data){
                noticeWindow.style.display = "none";
                noticeSection.style.display = "block";
                deletePostCheckFrame.style.display = "none";
                if(data.ok == true){
                    postArticle.remove();
                }else{
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message; 
                }
            })
        })
    })
}

// add post's comment
function addComment(postID, postArticle, viewAllComment, allComments, totalCommentsAmount){
    const leaveComment = postArticle.querySelector(".leaveComment")
    leaveComment.addEventListener("keydown", (e) =>{
        const comment = leaveComment.value;
        // enter 的 keyCode 是 13
        if( e.keyCode === 13 ){
            if(comment == ""){
                noticeWindow.style.display="block";
                noticeMain.textContent = "Comment text can't be empty!";
            }else{
                const dateTime = new Date();
                const timestamp = dateTime.getTime();
                const addComment = {
                    "postID":postID,
                    "comment":comment,
                    "dateTime":timestamp
                };
                fetch("/api/post/comment",{
                    method:"POST",
                    body:JSON.stringify(addComment),
                    headers:new Headers({
                        "content-type":"application/json"
                    })
                }).then((response) => {
                    return response.json();
                }).then((data) => {
                    const totalCommentsInfo = data.data;
                    if (data.error == true){
                        noticeWindow.style.display="block";
                        noticeMain.textContent = data.message;
                    }else if(data.data == null){
                        allComments.style.display = "none";
                        viewAllComment.style.display = "none";
                        totalCommentsAmount.textContent = "0 Comment";
                        totalCommentsAmount.style.pointerEvents = "none";
                    }else{
                        allComments.innerHTML = "";
                        totalCommentsAmount.style.pointerEvents = "auto";
                        createAllComments(totalCommentsInfo, totalCommentsAmount, viewAllComment, allComments, postID);
                        if(totalCommentsInfo.length == 1){
                            viewAllComment.style.display="block";
                        }
                        if(totalCommentsInfo.length <  2 ){
                            totalCommentsAmount.textContent =totalCommentsInfo.length + " Comment";        
                        }else{
                            totalCommentsAmount.textContent = totalCommentsInfo.length + " Comments"; 
                        }
                        leaveComment.value = "";
                    }
                })                
            }
        }
    }, false);
};

// delete comment
function deleteUserComment(postID, commentID, deleteComment, viewAllComment, allComments, totalCommentsAmount){
    deleteComment.addEventListener("click", () => {
        noticeWindow.style.display = "block";
        noticeSection.style.display = "none";
        deleteCommentCheckFrame.style.display = "block";
        deleteCommentCancelButton.addEventListener("click", () => {
            noticeWindow.style.display = "none";
            noticeSection.style.display = "block";
            deleteCommentCheckFrame.style.display = "none";
        })
        deleteCommentConfirmButton.addEventListener("click", () => {
            fetch(`/api/post/comment?postID=${postID}&commentID=${commentID}`,{
                method:"DELETE",
            }).then(function(response){
                return response.json();  
            }).then(function(data){
                noticeWindow.style.display = "none";
                noticeSection.style.display = "block";
                deleteCommentCheckFrame.style.display = "none";
                const totalCommentsInfo = data.data;
                if (data.error == true){
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message;
                }else if(data.data == null){
                    allComments.style.display = "none";
                    viewAllComment.style.display = "none";
                    totalCommentsAmount.textContent = "0 Comment";
                    totalCommentsAmount.style.pointerEvents = "none";
                }else{
                    allComments.innerHTML = "";
                    createAllComments(totalCommentsInfo, totalCommentsAmount, viewAllComment, allComments, postID);
                    if(totalCommentsInfo.length <  2 ){
                        totalCommentsAmount.textContent =totalCommentsInfo.length + " Comment";        
                    }else{
                        totalCommentsAmount.textContent = totalCommentsInfo.length + " Comments"; 
                    }
                }
            })
        })
    })
}

function updateLikes(postID, like, likeImg, likeStatus, totalLikesText, totalLikesAmount, likeID){
    like.addEventListener("click", () => {
        like.style.pointerEvents = "none";
        let newTotalLikesInfo;
        let totalLikes;
        if(likeStatus == 0){
            const addLikeInfo = {
                "postID": postID
            }
            fetch("/api/post/like",{
                method:"POST",
                body:JSON.stringify(addLikeInfo),
                headers:new Headers({
                    "content-type":"application/json"
                })
            }).then(function(response){
                return response.json();  
            }).then(function(data){
                like.style.pointerEvents = "auto";
                if(data.error == true){
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message;
                }else{
                    likeImg.src = "/Images/likeAfter.png";
                    likeStatus = 1; //like
                    newTotalLikesInfo = data.data;
                    for(let i=0 ; i < newTotalLikesInfo.length ; i++){
                        if(thisUserID == newTotalLikesInfo[i].postLikeUserID){
                            likeID = newTotalLikesInfo[i].postLikeID;
                        }
                    }
                    totalLikes = newTotalLikesInfo.length;
                    if(totalLikes < 2 ){
                        totalLikesText.textContent = totalLikes + " Like";       
                    }else{
                        totalLikesText.textContent = totalLikes + " Likes";
                    }                 
                }
            })
        }else{
            fetch(`/api/post/like?postID=${postID}&likeID=${likeID}`,{
                method:"DELETE",
            }).then(function(response){
                return response.json();  
            }).then(function(data){
                like.style.pointerEvents = "auto";
                if(data.error == true){
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message;
                }else if(data.data == null){;
                    newTotalLikesInfo = data.data;
                    totalLikes = 0;
                    totalLikesText.textContent = "0 Like";
                    likeImg.src = "/Images/like.png";
                    likeStatus = 0; //dislike
                }else{
                    likeImg.src = "/Images/like.png";
                    likeStatus = 0;
                    newTotalLikesInfo = data.data;
                    totalLikes = newTotalLikesInfo.length;
                    if(totalLikes < 2 ){
                        totalLikesText.textContent = totalLikes + " Like";       
                    }else{
                        totalLikesText.textContent = totalLikes + " Likes";
                    }
                }
            })
        }
        totalLikesAmount.addEventListener("click", () => {
            showPostLikeList(totalLikes, newTotalLikesInfo);
            noticeWindow.style.display = "block";
            noticeSection.style.display = "none";
            postLikeFrame.style.display = "block";
        })
    })
}

function showPostLikeList(totalLikes, totalLikesInfo){
    if(totalLikes == 0){
        postLikeList.style.display = "none";
        noLike.style.display = "flex";
    }else{
        noLike.style.display = "none";
        postLikeList.style.display = "block";
        postLikeList.innerHTML = "";
        for(let i=0 ; i < totalLikesInfo.length ; i++){
            const oneLike = document.createElement("div");
            oneLike.setAttribute("class", "oneLike");
            const likeAvatarImg = document.createElement("img");
            if(totalLikesInfo[i].postLikeAvatar){
               likeAvatarImg.setAttribute("src", totalLikesInfo[i].postLikeAvatar);  
            }else{
               likeAvatarImg.setAttribute("src", "/Images/avatar.png");
            }
            const likeUserName = document.createElement("div");
            likeUserName.setAttribute("class", "likeUserName");
            likeUserName.textContent = totalLikesInfo[i].postLikeUserName;
            oneLike.appendChild(likeAvatarImg);
            oneLike.appendChild(likeUserName);
            postLikeList.appendChild(oneLike);
        }        
    }
}

function timeCalculate(dateTime) {
    const now = new Date().getTime();
    const timeDifference = now - dateTime;
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;

    if(timeDifference < minute) {
        return "Just now";
    }else if(timeDifference < hour) {
        return Math.floor(timeDifference / minute) + "m";
    }else if(timeDifference < day) {
        return Math.floor(timeDifference / hour) + "h";
    }else if(timeDifference < week){
        return Math.floor(timeDifference / day) + "d";
    }else{
        return Math.floor(timeDifference / week) + "w";
    }
}