const postFrame = document.querySelector(".postFrame");
const showPostsFrame = document.querySelector(".showPostsFrame");
const list = document.querySelector(".list");
const all = document.querySelector(".all");
const yummyFood = document.querySelector(".yummyFood");
const weightLoss = document.querySelector(".weightLoss");
const cooking = document.querySelector(".cooking");
const chat = document.querySelector(".chat");
const postUserAvatarImg = document.querySelector(".postUserAvatar img");
const memberName = document.querySelector(".memberName");
const photoUploader = document.querySelector(".photoUploader");
const postBlock = document.querySelector(".postBlock");
const postBlockHr = document.querySelector(".postBlockHr");
const addPostLocation = document.querySelector(".addPostLocation");
const locationFrame = document.querySelector(".locationFrame");
const closeLocationFrame = document.querySelector(".closeLocationFrame");
const locationInput = document.querySelector(".locationInput");
const searchLocationResultList = document.querySelector(".searchLocationResultList");
const goSearchLocation = document.querySelector(".goSearchLocation");
const noSearchLocationResult = document.querySelector(".noSearchLocationResult");
const deletePostCheckFrame = document.querySelector(".deletePostCheckFrame");
const deletePostCancelButton = document.querySelector(".deletePostCancelButton");
const deletePostConfirmButton = document.querySelector(".deletePostConfirmButton");
const deleteCommentCheckFrame = document.querySelector(".deleteCommentCheckFrame");
const deleteCommentCancelButton = document.querySelector(".deleteCommentCancelButton");
const deleteCommentConfirmButton = document.querySelector(".deleteCommentConfirmButton");
const postForum = document.querySelector(".postForum");
const postForumBlock = document.querySelector(".postForumBlock");
const postForumYummyFood = document.querySelector(".postForumYummyFood");
const postForumWeightLoss = document.querySelector(".postForumWeightLoss");
const postForumCooking = document.querySelector(".postForumCooking");
const postForumChat = document.querySelector(".postForumChat");
const postButton = document.querySelector(".postButton");
const postTextInput = document.querySelector(".postTextInput");
const postLoading = document.querySelector(".postLoading");
const showPostsLoading = document.querySelector(".showPostsLoading");
const contentPhotoEnlargeFrame = document.querySelector(".contentPhotoEnlargeFrame");
const contentPhotoEnlarge = document.querySelector(".contentPhotoEnlarge");
const closePhotoEnlargeFrame = document.querySelector(".closePhotoEnlargeFrame");
const postLikeFrame = document.querySelector(".postLikeFrame");
const closePostLikeFrame = document.querySelector(".closePostLikeFrame");
const postLikeList = document.querySelector(".postLikeList");
const noLike = document.querySelector(".noLike");

let postForumBlockStatus = 0 // status = close
// click postForum : show/hide postForumBlock
let postForumChoose;
let postLocationChoose = null;
let postLocationPlaceID;
let userAvatar = null;
let thisUserID;
let forumPage = "all";  // ??????list??????????????????
let postPage = 0;   //?????????????????????????????????????????????(5 posts/page)
let isLoading = false;    // ????????????????????????????????????????????? API(true ??????????????????????????? API)

all.addEventListener("click", () => {
    forumPage = "all";
    getPosts();
    all.style.color = "#c23a2b";
    all.style.background = "#faebd7";
    all.style.fontWeight = "bold";
    yummyFood.style.color ="#000000";
    yummyFood.style.background = "none";
    yummyFood.style.fontWeight = "normal";
    weightLoss.style.color ="#000000";
    weightLoss.style.background = "none";
    weightLoss.style.fontWeight = "normal";
    cooking.style.color ="#000000";
    cooking.style.background = "none";
    cooking.style.fontWeight = "normal";
    chat.style.color ="#000000";
    chat.style.background = "none";
    chat.style.fontWeight = "normal";
});

yummyFood.addEventListener("click", () => {
    forumPage = 1;
    getPosts();
    all.style.color ="#000000";
    all.style.background = "none";
    all.style.fontWeight = "normal";
    yummyFood.style.color = "#c23a2b";
    yummyFood.style.background = "#faebd7";
    yummyFood.style.fontWeight = "bold";
    weightLoss.style.color="#000000";
    weightLoss.style.background = "none";
    weightLoss.style.fontWeight = "normal";
    cooking.style.color ="#000000";
    cooking.style.background = "none";
    cooking.style.fontWeight = "normal";
    chat.style.color ="#000000";
    chat.style.background = "none";
    chat.style.fontWeight = "normal";
}); 

weightLoss.addEventListener("click", () => {
    forumPage = 2;
    getPosts();
    all.style.color ="#000000";
    all.style.background = "none";
    all.style.fontWeight = "normal";
    yummyFood.style.color ="#000000";
    yummyFood.style.background = "none";
    yummyFood.style.fontWeight = "normal";
    weightLoss.style.color = "#c23a2b";
    weightLoss.style.background = "#faebd7";
    weightLoss.style.fontWeight = "bold";
    cooking.style.color ="#000000";
    cooking.style.background = "none";
    cooking.style.fontWeight = "normal";
    chat.style.color ="#000000";
    chat.style.background = "none";
    chat.style.fontWeight = "normal";
});

cooking.addEventListener("click", () => {
    forumPage = 3;
    getPosts();
    all.style.color ="#000000";
    all.style.background = "none";
    all.style.fontWeight = "normal";
    yummyFood.style.color ="#000000";
    yummyFood.style.background = "none";
    yummyFood.style.fontWeight = "normal";
    weightLoss.style.color ="#000000";
    weightLoss.style.background = "none";
    weightLoss.style.fontWeight = "normal";
    cooking.style.color = "#c23a2b";
    cooking.style.background = "#faebd7";
    cooking.style.fontWeight = "bold";
    chat.style.color ="#000000";
    chat.style.background = "none";
    chat.style.fontWeight = "normal";
});

chat.addEventListener("click", () => {
    forumPage = 4;
    getPosts();
    all.style.color ="#000000";
    all.style.background = "none";
    all.style.fontWeight = "normal";
    yummyFood.style.color ="#000000";
    yummyFood.style.background = "none";
    yummyFood.style.fontWeight = "normal";
    weightLoss.style.color="#000000";
    weightLoss.style.background = "none";
    weightLoss.style.fontWeight = "normal";
    cooking.style.color ="#000000";
    cooking.style.background = "none";
    cooking.style.fontWeight = "normal";
    chat.style.color = "#c23a2b";
    chat.style.background = "#faebd7";
    chat.style.fontWeight = "bold"
});

postForum.addEventListener("click", () =>{
    if(postForumBlockStatus == 0){
        postForumBlock.style.display = "block";
        postForumBlockStatus = 1;
    }else{
        postForumBlock.style.display = "none";
        postForumBlockStatus = 0;     
    }
})

document.addEventListener("mousedown", () => {
    if (postForumBlockStatus == 1) {
        setTimeout(() => {
            postForumBlock.style.display = "none";
            postForumBlockStatus = 0;
        },150)
    }
});

postForumYummyFood.addEventListener("click", () => {
    postForum.textContent = "Yummy Food";
    postForumChoose = 1;
});
postForumWeightLoss.addEventListener("click", () => {
    postForum.textContent = "Weight Loss";
    postForumChoose = 2;
});
postForumCooking.addEventListener("click", () => {
    postForum.textContent = "Cooking";
    postForumChoose = 3;
});
postForumChat.addEventListener("click", () => {
    postForum.textContent = "Chat";
    postForumChoose = 4;
});

addPostLocation.addEventListener("click", async() => {
    noticeWindow.style.display = "block";
    noticeSection.style.display = "none";
    locationFrame.style.display = "block";
})

closeLocationFrame.addEventListener("click", () => {
    noticeWindow.style.display = "none";
    noticeSection.style.display = "block";
    locationFrame.style.display = "none";
    searchLocationResultList.style.display="none";
    noSearchLocationResult.style.display="none";
    goSearchLocation.style.display="block";
    locationInput.value = "";
})

closePostLikeFrame.addEventListener("click", () => {
    noticeWindow.style.display = "none";
    noticeSection.style.display = "block";
    postLikeFrame.style.display = "none";
})

noticeWindow.addEventListener("click", () => {
    noticeWindow.style.display = "none";
    noticeSection.style.display = "block";
    locationFrame.style.display = "none";
    searchLocationResultList.style.display="none";
    noSearchLocationResult.style.display="none";
    goSearchLocation.style.display="block";
    locationInput.value = "";
    
    contentPhotoEnlargeFrame.style.display = "none";
    contentPhotoEnlarge.src = "";

    postLikeFrame.style.display = "none";
})

locationInput.addEventListener("click", () => {
    locationInput.select();
});

closePhotoEnlargeFrame.addEventListener("click", () => {
    contentPhotoEnlarge.src = "";
    noticeWindow.style.display = "none";
    noticeSection.style.display = "block";
    contentPhotoEnlargeFrame.style.display = "none";
});

// get signin status/information API
fetch("/api/user").then(function(response){
    return response.json();
}).then(function(data){
    if(data.error == true){
        location.href="/login";
    }else{
        const userData = data.data;
        memberName.textContent = userData.name;
        thisUserID = userData.userID;
    }
});

// get user avatar
fetch("/api/photo/avatar").then((response) => {
    return response.json();
}).then((data) => {
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;
    }else if(data.data == null){
        postUserAvatarImg.src = "/Images/avatar.png";
    }else{
        postUserAvatarImg.src = data.data;
        userAvatar = data.data;
    }
})

// preview photo of post
photoUploader.addEventListener("change", async() => {
    const nowPreviewPhotos = document.querySelectorAll(".postPhotoBlock");
    nowPreviewPhotos.forEach((removePreviewPhoto) =>{
        removePreviewPhoto.remove();
    })
    const imageFiles = photoUploader.files;
    if(imageFiles.length == 0){
        noticeWindow.style.display="block";
        noticeMain.textContent = "No file selected.";
    }else if(imageFiles.length > 3){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Up to 3 photos/post";
    }else{
        const postPhotoRegion = document.createElement("div");
        postPhotoRegion.setAttribute("class","postPhotoRegion");
        const haveLocation = document.querySelector(".locationLinkBlock");
        if (haveLocation){
            postBlock.insertBefore(postPhotoRegion, haveLocation);    
        }else{
            postBlock.insertBefore(postPhotoRegion, postBlockHr);
        };
        for(let i=0 ; i < imageFiles.length ; i++){
            const imageType = imageFiles[i]["type"].slice(6)
            const reader = new FileReader();
            reader.readAsArrayBuffer(imageFiles[i])
            await new Promise((resolve) => {
                reader.onload =  async() => {
                    arrayBuffer = reader.result;
                    const blob = new Blob([arrayBuffer], {type:`image/${imageType}`});
                    const postPhotoBlock = document.createElement("div");
                    postPhotoBlock.setAttribute("class","postPhotoBlock");
                    const postPhoto = document.createElement("div");
                    postPhoto.setAttribute("class","postPhoto");
                    const postPhotoImg = document.createElement("img");
                    postPhotoImg.setAttribute("src",URL.createObjectURL(blob));
                    postPhoto.appendChild(postPhotoImg);
                    const postPhotoCancelIcon = document.createElement("div");
                    postPhotoCancelIcon.setAttribute("class","postPhotoCancelIcon");
                    const cancelIconImg = document.createElement("img");
                    cancelIconImg.setAttribute("src","/Images/cancel.png");
                    postPhotoCancelIcon.appendChild(cancelIconImg);                  
                    postPhotoBlock.appendChild(postPhoto);
                    postPhotoBlock.appendChild(postPhotoCancelIcon); 
                    postPhotoRegion.appendChild(postPhotoBlock);
                    resolve(); 
                };
            });
        }
        deletePostPhotos(); 
    }
});

// delete preview photo
function deletePostPhotos(){
    let previewPhotos = document.querySelectorAll(".postPhotoBlock")
    previewPhotos.forEach((deletePreviewPhoto) =>{
        const postPhotoCancelIcon = deletePreviewPhoto.querySelector(".postPhotoCancelIcon");
        postPhotoCancelIcon.addEventListener("click",() => {
            // ????????????????????????????????????????????????
            deletePreviewPhoto.remove();
            // ???????????????????????????????????????????????????
            let index = Array.from(previewPhotos).indexOf(deletePreviewPhoto);

            let imageFiles = photoUploader.files;
            // ???FileList?????????array
            let imageFilesArray = Array.from(imageFiles);
            imageFilesArray.splice(index, 1); // ??????array???index?????????????????????
            //???array?????????FileList?????????JavaScript??????DataTransfer??????
            const dataTransfer = new DataTransfer();
            imageFilesArray.forEach((file) => {
                dataTransfer.items.add(file);
            });
            // ???DataTransfer???????????????FileList
            const newFileList = dataTransfer.files;
            // ???input???files?????????newFileList
            photoUploader.files = newFileList;
            // ?????????????????????previewPhotos???????????????????????????????????????index???????????????
            previewPhotos = document.querySelectorAll(".postPhotoBlock");
            const havePreviewPhoto = document.querySelector(".postPhotoBlock");
            if (havePreviewPhoto == null){
                const postPhotoRegion = document.querySelector(".postPhotoRegion");
                postPhotoRegion.remove();
            }  
        })  
    })
}

let timer;
// fuzzy match(search) of location
locationInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
    const locationKeyword = locationInput.value;
        if(locationKeyword.length === 0){
            searchLocationResultList.style.display="none";
            noSearchLocationResult.style.display="none";
            goSearchLocation.style.display="block";
        }else{
            goSearchLocation.style.display="none";
            fetch(`/api/location?keyword=${locationKeyword}`).then(function(response){
                return response.json();  
            }).then(function(data){
                const searchResults = document.querySelectorAll(".oneSearchLocationResult");
                if(searchResults[0]){
                    searchResults.forEach(element => {
                        element.remove();
                    });          
                };
                let allLocationDataInfo;
                if(data.error == true){
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message;
                }else if(data.data == null){
                    searchLocationResultList.style.display="none";
                    noSearchLocationResult.style.display="block";
                }else{
                    noSearchLocationResult.style.display="none";
                    searchLocationResultList.style.display="block";
                    allLocationDataInfo = data.data;
                    for(let i=0 ; i < allLocationDataInfo.length ; i++){
                        const oneSearchLocationResult = document.createElement("div");
                        oneSearchLocationResult.setAttribute("class","oneSearchLocationResult");
                        const locationResultName = document.createElement("div");
                        locationResultName.setAttribute("class","oneSearchLocationResultName");
                        locationResultName.textContent = allLocationDataInfo[i].name;
                        const locationResultAddress = document.createElement("div");
                        locationResultAddress.setAttribute("class","oneSearchLocationResultAddress");
                        locationResultAddress.textContent = allLocationDataInfo[i].address;
                        oneSearchLocationResult.appendChild(locationResultName);
                        oneSearchLocationResult.appendChild(locationResultAddress);
                        searchLocationResultList.appendChild(oneSearchLocationResult); 
                    };                          
                };
                const searchLocationResults = document.getElementsByClassName("oneSearchLocationResult");
                for(let i=0 ; i < searchLocationResults.length ; i++){
                    searchLocationResults[i].addEventListener("click", () => {
                        const locationName = searchLocationResults[i].querySelector(".oneSearchLocationResultName").textContent;
                        locationInput.value = locationName; // = allLocationDataInfo[i].name
                        postLocationChoose = locationName;
                        const queryPlaceId = allLocationDataInfo[i].placeID;
                        postLocationPlaceID = queryPlaceId;
                        searchLocationResultList.style.display="none";
                        noticeWindow.style.display = "none";
                        noticeSection.style.display = "block";
                        locationFrame.style.display = "none";
                        const haveLocationLinkBlock= document.querySelector(".locationLinkBlock")
                        if(haveLocationLinkBlock){
                            haveLocationLinkBlock.remove();
                        }
                        const locationLinkBlock = document.createElement("div");
                        locationLinkBlock.setAttribute("class","locationLinkBlock");
                        const locationChooseLink = document.createElement("a");
                        locationChooseLink.setAttribute("class","locationLink");
                        locationChooseLink.setAttribute("href",`https://www.google.com/maps/search/?api=1&query=${locationName}&query_place_id=${queryPlaceId}`);
                        locationChooseLink.setAttribute("target", "_blank");
                        const locationChooseIcon = document.createElement("div");
                        locationChooseIcon.setAttribute("class","locationChooseIcon");
                        const locationChooseImg = document.createElement("img");
                        locationChooseImg.setAttribute("src","/Images/region.png");
                        locationChooseIcon.appendChild(locationChooseImg);
                        const locationChoose = document.createElement("div");
                        locationChoose.setAttribute("class","locationChoose");
                        locationChoose.textContent = locationName;
                        locationChooseLink.appendChild(locationChooseIcon);
                        locationChooseLink.appendChild(locationChoose);
                        const removeLocationIcon = document.createElement("div");
                        removeLocationIcon.setAttribute("class","removeLocationIcon");
                        const removeLocationIconImg = document.createElement("img");
                        removeLocationIconImg.setAttribute("src","/Images/removetag.png");
                        removeLocationIcon.appendChild(removeLocationIconImg);
                        locationLinkBlock.appendChild(locationChooseLink);
                        locationLinkBlock.appendChild(removeLocationIcon);
                        postBlock.insertBefore(locationLinkBlock, postBlockHr);
                        locationInput.value = "";
                        searchLocationResultList.style.display="none";
                        noSearchLocationResult.style.display="none";
                        goSearchLocation.style.display="block";
                        removeLocation();
                    });  
                };              
            });  
        }
    }, 500);
});

function removeLocation(){
    const removeLocationIcon = document.querySelector(".removeLocationIcon")
    removeLocationIcon.addEventListener("click", () => {
        const locationLinkBlock = document.querySelector(".locationLinkBlock");
        locationLinkBlock.remove();
        postLocationChoose = null;
    })

};

postButton.addEventListener("click", () => {
    const postText = postTextInput.value;
    if(postForumChoose == null){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Choose posting forum.";     
    }else if(postText == ""){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Post text can't be empty!"; 
    }else{
        const dateTime = new Date();
        const timestamp = dateTime.getTime();
        const imageFiles = photoUploader.files;
        postBlock.style.display="none";
        postLoading.style.display="flex";
        let formData = new FormData();
        if(imageFiles[0]){
            if(imageFiles.length > 3){
                noticeWindow.style.display="block";
                noticeMain.textContent = "Up to 3 photos/post";
            }else{
                for(let i=0 ; i < imageFiles.length ; i++){
                    formData.append("images", imageFiles[i])
                };
            }
        }
        formData.append("dateTime", timestamp);
        formData.append("forum", postForumChoose);
        formData.append("postText", postText);
        if(postLocationChoose){
            formData.append("location", postLocationChoose);
        }
        fetch("/api/post",{
            method:"POST",
            body:formData            
        }).then((response) => {
            return response.json();
        }).then((data) => {
            postLoading.style.display="none";
            postBlock.style.display="block";
            if (data.error == true){
                noticeWindow.style.display="block";
                noticeMain.textContent = data.message;
            }else{
                postForum.textContent = "Posting Forum";
                postForumChoose = null;
                postTextInput.value="";
                const locationLinkBlock = document.querySelector(".locationLinkBlock");
                if(locationLinkBlock){
                    locationLinkBlock.remove();
                    postLocationChoose = null;             
                }
                const previewPhotos = document.querySelectorAll(".postPhotoBlock");
                if(previewPhotos[0]){
                    previewPhotos.forEach((deletePreviewPhoto) =>{
                        deletePreviewPhoto.remove();
                    })
                    photoUploader.value="";
                }
                getPosts();
            }
        })
    }
})