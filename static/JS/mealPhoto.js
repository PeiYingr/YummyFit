const foodPhotoRegion = document.querySelector(".foodPhotoRegion");
const fileUploader = document.querySelector(".fileUploader");
const sendImageButton = document.querySelector(".sendImageButton");
const noPhotos = document.querySelector(".noPhotos");
const foodPhotosUploadLoading = document.querySelector(".foodPhotosUploadLoading");
const sendImageRegion = document.querySelector(".sendImageRegion");
// get meal photo
getMealPhotos();

// show meal photo
function showMealPhoto(mealphoto){
    const foodPhotoBlock = document.createElement("div");
    foodPhotoBlock.setAttribute("class","foodPhotoBlock");
    const foodPhoto = document.createElement("div");
    foodPhoto.setAttribute("class","foodPhoto");
    const foodPhotoImg = document.createElement("img");
    foodPhotoImg.setAttribute("src",mealphoto.photo);
    foodPhoto.appendChild(foodPhotoImg);
    const photoDeleteIcon = document.createElement("div");
    photoDeleteIcon.setAttribute("class","photoDeleteIcon");
    const deleteIconImg = document.createElement("img");
    deleteIconImg.setAttribute("src","/Images/delete.png");
    photoDeleteIcon.appendChild(deleteIconImg);
    foodPhotoBlock.appendChild(foodPhoto);
    foodPhotoBlock.appendChild(photoDeleteIcon);
    foodPhotoRegion.appendChild(foodPhotoBlock);
    const mealPhotoID = mealphoto.mealPhotoID;
    deleteOnePhotos(foodPhotoBlock, photoDeleteIcon, mealPhotoID); 
};

// get user's meal photo
async function getMealPhotos(){
    foodPhotoRegion.innerHTML="";
    const response = await fetch(`/api/photo/meal?meal=${chooseIntakeMeal}&date=${chooseIntakeDate}`);
    const data = await response.json();
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;  
    }else if(data.data == null){
        foodPhotoRegion.style.display="none";
        noPhotos.style.display="block";
    }else{
        noPhotos.style.display="none";
        foodPhotoRegion.style.display="flex";
        foodPhotoRegion.innerHTML="";
        const mealPhotos = data.data
        mealPhotos.forEach((mealphoto) => {
            showMealPhoto(mealphoto)
        })
    }
}

// preview photo of meal
fileUploader.addEventListener("change", async() => {
    const nowPreviewPhotos = document.querySelectorAll(".previewPhotoBlock");
    nowPreviewPhotos.forEach((removePreviewPhoto) =>{
        removePreviewPhoto.remove();
    })
    const imageFiles = fileUploader.files;
    const foodPhotoNumber = document.querySelectorAll(".foodPhotoBlock");
    if(imageFiles.length == 0){
        noticeWindow.style.display="block";
        noticeMain.textContent = "No file selected.";
        if(foodPhotoNumber.length + imageFiles.length == 0){
            noPhotos.style.display="block";
            foodPhotoRegion.style.display="none";
        }
    }else if(foodPhotoNumber.length + imageFiles.length >3){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Up to 3 photos/meal";
    }else{
        noPhotos.style.display="none";
        foodPhotoRegion.style.display="flex";
        for(let i=0 ; i < imageFiles.length ; i++){
            const imageType = imageFiles[i]["type"].slice(6)
            const reader = new FileReader();
            reader.readAsArrayBuffer(imageFiles[i])
            // 這會在readAS後才執行
            await new Promise((resolve) => {
                reader.onload =  async() => {
                    arrayBuffer = reader.result;
                    const blob = new Blob([arrayBuffer], {type:`image/${imageType}`});
                    const previewPhotoBlock = document.createElement("div");
                    previewPhotoBlock.setAttribute("class","previewPhotoBlock");
                    const previewPhoto = document.createElement("div");
                    previewPhoto.setAttribute("class","previewPhoto");
                    const previewPhotoImg = document.createElement("img");
                    previewPhotoImg.setAttribute("src",URL.createObjectURL(blob));
                    previewPhoto.appendChild(previewPhotoImg);
                    const previewCancelIcon = document.createElement("div");
                    previewCancelIcon.setAttribute("class","previewCancelIcon");
                    const cancelIconImg = document.createElement("img");
                    cancelIconImg.setAttribute("src","/Images/cancel.png");
                    previewCancelIcon.appendChild(cancelIconImg);                  
                    previewPhotoBlock.appendChild(previewPhoto);
                    previewPhotoBlock.appendChild(previewCancelIcon); 
                    const previewPhotoPreviewText = document.createElement("div");
                    previewPhotoPreviewText.setAttribute("class","previewPhotoPreviewText");
                    previewPhotoPreviewText.textContent = "preview";
                    previewPhotoBlock.appendChild(previewPhotoPreviewText);
                    foodPhotoRegion.appendChild(previewPhotoBlock);
                    resolve(); 
                };
            });
        }
        deletePreviewPhotos(); 
    }
});

// send new meal photo to server
sendImageButton.addEventListener("click",() => {
    const imageFiles = fileUploader.files;
    if(imageFiles[0]){
        if(imageFiles.length > 3){
            noticeWindow.style.display="block";
            noticeMain.textContent = "Up to 3 photos/meal";
        }else{
            sendImageRegion.style.display="none";
            noPhotos.style.display="none";
            foodPhotoRegion.style.display="none";
            foodPhotosUploadLoading.style.display="block";
            let formData = new FormData();
            for(let i=0 ; i < imageFiles.length ; i++){
                formData.append("images", imageFiles[i])
            };
            formData.append("date", chooseIntakeDate);
            formData.append("whichMeal", chooseIntakeMeal);
            fetch("/api/photo/meal",{
                method:"POST",
                body:formData            
            }).then((response) => {
                return response.json();
            }).then((data) => {
                foodPhotosUploadLoading.style.display="none";
                if (data.error == true){
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message;
                }else if(data.data == null){
                    foodPhotoRegion.style.display="none";
                    noPhotos.style.display="block";
                }else{
                    noPhotos.style.display="none";
                    sendImageRegion.style.display="flex";
                    foodPhotoRegion.style.display="flex";
                    foodPhotoRegion.innerHTML="";
                    fileUploader.value = "";
                    const mealPhotos = data.data
                    mealPhotos.forEach((mealphoto) => {
                        showMealPhoto(mealphoto)
                    })
                }
            })
        }        
    }else{
        noticeWindow.style.display="block";
        noticeMain.textContent = "No file selected.";
    }
})

// delete meal photo
function deleteOnePhotos(foodPhotoBlock, photoDeleteIcon, mealPhotoID){
    photoDeleteIcon.addEventListener("click",() => {
        const deletePhoto = {
            "mealPhotoID": mealPhotoID,
        };
        fetch("/api/photo/meal",{
            method:"DELETE",
            body:JSON.stringify(deletePhoto),
            headers:new Headers({
                "content-type":"application/json"
            })
        }).then(function(response){
            return response.json();  
        }).then(function(data){
            if(data.ok == true){
                foodPhotoBlock.remove();
                const havePhoto = document.querySelector(".foodPhotoBlock")
                if (havePhoto == null){
                    foodPhotoRegion.style.display="none";
                    noPhotos.style.display="block";
                }
            }else{
                noticeWindow.style.display="block";
                noticeMain.textContent = data.message; 
            }
        })
    })
}

// delete preview photo
function deletePreviewPhotos(){
    let previewPhotos = document.querySelectorAll(".previewPhotoBlock")
    previewPhotos.forEach((deletePreviewPhoto) =>{
        const previewCancelIcon = deletePreviewPhoto.querySelector(".previewCancelIcon");
        previewCancelIcon.addEventListener("click",() => {
            // 畫面上移除使用者要刪掉的預覽照片
            deletePreviewPhoto.remove();
            // 找出被刪掉預覽照片在陣列中是第幾個
            let index = Array.from(previewPhotos).indexOf(deletePreviewPhoto);

            let imageFiles = fileUploader.files;
            // 將FileList轉換為array
            let imageFilesArray = Array.from(imageFiles);
            imageFilesArray.splice(index, 1); // 刪除array中index為第幾個的元素
            //將array轉換回FileList，使用JavaScript中的DataTransfer物件
            const dataTransfer = new DataTransfer();
            imageFilesArray.forEach((file) => {
                dataTransfer.items.add(file);
            });
            // 將DataTransfer轉換為新的FileList
            const newFileList = dataTransfer.files;
            // 把input的files值改為newFileList
            fileUploader.files = newFileList;
            // 從抓一次所有的previewPhotos，這樣按下一個刪除時上面的index才會是對的
            previewPhotos = document.querySelectorAll(".previewPhotoBlock");
            const havePreviewPhoto = document.querySelector(".previewPhotoBlock");
            if (havePreviewPhoto == null){
                getMealPhotos();
            }  
        })  
    })
}