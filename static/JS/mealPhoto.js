const foodPhotoRegion = document.querySelector(".foodPhotoRegion");
const fileUploader = document.querySelector(".fileUploader");
const foodPhotoImg = document.querySelector(".foodPhoto img");
const foodPhotoPreviewText = document.querySelector(".foodPhotoPreviewText");
const sendImageButton = document.querySelector(".sendImageButton");
const noPhotos = document.querySelector(".noPhotos");

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
};

// get user's meal photo
async function getMealPhotos(){
    const response = await fetch(`/api/photo/meal?meal=${chooseIntakeMeal}&date=${timestamp}`);
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
        deleteOnePhotos();
    }
}

// preview photo of meal
fileUploader.addEventListener("change", () => {
    const imageFiles = fileUploader.files;
    const foodPhotoNumber = document.querySelectorAll(".foodPhotoBlock");
    if(foodPhotoNumber.length + imageFiles.length >3){
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
            reader.onload =  async() => {
                arrayBuffer = reader.result;
                const blob = new Blob([arrayBuffer], {type:`image/${imageType}`});
                const foodPhotoBlock = document.createElement("div");
                foodPhotoBlock.setAttribute("class","foodPhotoBlock");
                const foodPhoto = document.createElement("div");
                foodPhoto.setAttribute("class","foodPhoto");
                const foodPhotoImg = document.createElement("img");
                foodPhotoImg.setAttribute("src",URL.createObjectURL(blob));
                foodPhoto.appendChild(foodPhotoImg);
                const cancelIcon = document.createElement("div");
                cancelIcon.setAttribute("class","cancelIcon");
                const deleteIconImg = document.createElement("img");
                deleteIconImg.setAttribute("src","/Images/cancel.png");
                cancelIcon.appendChild(deleteIconImg);                  
                foodPhotoBlock.appendChild(foodPhoto);
                foodPhotoBlock.appendChild(cancelIcon); 
                const foodPhotoPreviewText = document.createElement("div");
                foodPhotoPreviewText.setAttribute("class","foodPhotoPreviewText");
                foodPhotoPreviewText.textContent = "preview";
                foodPhotoBlock.appendChild(foodPhotoPreviewText);
                foodPhotoRegion.appendChild(foodPhotoBlock); 
            }; 
        }      
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
            let formData = new FormData();
            for(let i=0 ; i < imageFiles.length ; i++){
                formData.append("images", imageFiles[i])
            };
            formData.append("date", timestamp);
            formData.append("whichMeal", chooseIntakeMeal);
            fetch("/api/photo/meal",{
                method:"POST",
                body:formData            
            }).then((response) => {
                return response.json();
            }).then((data) => {
                if (data.error == true){
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message;
                }else if(data.data == null){
                    foodPhotoRegion.style.display="none";
                    noPhotos.style.display="block";
                }else{
                    noPhotos.style.display="none";
                    foodPhotoRegion.style.display="flex";
                    foodPhotoRegion.innerHTML="";
                    fileUploader.value = "";
                    const mealPhotos = data.data
                    mealPhotos.forEach((mealphoto) => {
                        showMealPhoto(mealphoto)
                    })
                    deleteOnePhotos();
                }
            })
        }        
    }else{
        noticeWindow.style.display="block";
        noticeMain.textContent = "No file selected.";
    }
})

// delete meal photo
function deleteOnePhotos(){
    const foodPhotos = document.querySelectorAll(".foodPhotoBlock")
    foodPhotos.forEach((deleteOnePhoto) =>{
        const photoDeleteIcon = deleteOnePhoto.querySelector(".photoDeleteIcon");
        photoDeleteIcon.addEventListener("click",() => {
            const photoImg = deleteOnePhoto.querySelector(".foodPhoto img").src;
            const deletePhoto = {
                "meal":chooseIntakeMeal,
                "date":timestamp,
                "photoUrl":photoImg
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
                    deleteOnePhoto.remove();
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
    })
}