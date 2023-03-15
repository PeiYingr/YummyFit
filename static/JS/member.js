const memberName = document.querySelector(".memberName");
const memberMail = document.querySelector(".memberMail");
const avatarFile = document.querySelector(".avatarFile");
const memberPhotoImg = document.querySelector(".memberPhoto img");
const avatarPreviewText = document.querySelector(".avatarPreviewText");
const avatarUpload = document.querySelector(".avatarUpload");
const editTarget = document.querySelector(".editTarget");
const cancelEditTarget = document.querySelector(".cancelEditTarget");
const targetBlock = document.querySelector(".targetBlock");
const targetInputBlock = document.querySelector(".targetInputBlock");
const updateTarget = document.querySelector(".updateTarget");
const targetKcalInput = document.querySelector(".targetKcalInput");
const targetProteinInput = document.querySelector(".targetProteinInput");
const targetFatInput = document.querySelector(".targetFatInput");
const targetCarbsInput = document.querySelector(".targetCarbsInput");
const targetMacrosValue = document.querySelector(".targetMacrosValue");
const targetMacrosPercentage = document.querySelector(".targetMacrosPercentage");
const noTargetData = document.querySelector(".noTargetData");
const targetKcalValue = document.querySelector(".targetKcalValue");
const targetProteinValue = document.querySelector(".targetProteinValue");
const targetFatValue = document.querySelector(".targetFatValue");
const targetCarbsValue = document.querySelector(".targetCarbsValue");
const targetProteinPercentage = document.querySelector(".targetProteinPercentage");
const targetFatPercentage = document.querySelector(".targetFatPercentage");
const targetCarbsPercentage = document.querySelector(".targetCarbsPercentage");
const avatarLoading = document.querySelector(".avatarLoading");
const form = document.querySelector("#form");
let imageType;
let arrayBuffer;

// get signin status/information API
fetch("/api/user").then(function(response){
    return response.json();
}).then(function(data){
    if(data.error == true){
        location.href="/login";
    }else{
        const userData = data.data;
        memberName.textContent = userData.name;
        memberMail.textContent = userData.email;
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
        memberPhotoImg.src = "/Images/avatar.png";
    }else{
        memberPhotoImg.src = data.data;
    }
})

// preview avatar photo
avatarFile.addEventListener("change", (e) => {
    avatarPreviewText.style.display="block";
    const imageFile = e.target.files[0];
    imageType = imageFile["type"].slice(6)
    const reader = new FileReader();
    reader.readAsArrayBuffer(imageFile)
    // 這會在readAS後才執行
    reader.onload =  () => {
        arrayBuffer = reader.result;
        const blob = new Blob([arrayBuffer], {type:`image/${imageType}`});
        memberPhotoImg.src = URL.createObjectURL(blob);
    };
});

// send/upload new avatar photo to server
avatarUpload.addEventListener("click",() => {
    avatarPreviewText.style.display="none";
    form.style.display="none";
    avatarLoading.style.display="flex";
    const file = document.querySelector('input[type="file"]');
    const imageFile = file.files[0];
    let formData = new FormData();
    formData.append("image", imageFile)
    fetch("/api/photo/avatar",{
        method:"PATCH",
        body:formData            
    }).then((response) => {
        return response.json();
    }).then((data) => {
        form.style.display="flex";
        avatarLoading.style.display="none";
        if (data.error == true){
            noticeWindow.style.display="block";
            noticeMain.textContent = data.message;
        }else{
            memberPhotoImg.src = data.data;
            file.value = "";            
        }
    })
})

// get user target
fetch("/api/target").then(function(response){
    return response.json();  
}).then(function(data){
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;  
    }else if(data.data == null){
        targetMacrosValue.style.display="none";
        targetMacrosPercentage.style.display="none";
        noTargetData.style.display="block";
    }else{
        const targetData = data.data;
        targetKcalValue.textContent = targetData.targetKcal;
        targetProteinValue.textContent = targetData.proteinAmount + "g";
        targetFatValue.textContent = targetData.fatAmount + "g";
        targetCarbsValue.textContent = targetData.carbsAmount + "g";
        targetProteinPercentage.textContent = "(" + targetData.targetProtein + "%)";
        targetFatPercentage.textContent = "(" + targetData.targetFat + "%)";
        targetCarbsPercentage.textContent = "(" + targetData.targetCarbs + "%)";
    }
})

editTarget.addEventListener("click",() => {
    targetBlock.style.display="none";
    targetInputBlock.style.display="block";
})

cancelEditTarget.addEventListener("click",() => {
    targetBlock.style.display="block";
    targetInputBlock.style.display="none";
})

// add/update user target
updateTarget.addEventListener("click",() => {
    const targetKcal = targetKcalInput.value;
    const targetProtein = targetProteinInput.value;
    const targetFat = targetFatInput.value;
    const targetCarbs = targetCarbsInput.value;
    if(targetKcal == "" || Number(targetKcal)<0 || !Number.isInteger(Number(targetKcal))){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter an integer Calories."; 
    }else if(targetProtein == "" || Number(targetProtein)<0 || !Number.isInteger(Number(targetProtein))){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter an integer percentage of protein."; 
    }else if(targetFat == "" || Number(targetFat)<0 || !Number.isInteger(Number(targetFat))){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter an integer percentage of fat."; 
    }else if(targetCarbs == "" || Number(targetCarbs)<0 || !Number.isInteger(Number(targetCarbs))){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter an integer percentage of carbs."; 
    }else if( Number(targetProtein)+Number(targetFat)+Number(targetCarbs) !== 100 ){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Percentages not adding up to 100%."; 
    }else{
        const addTarget = { 
            "targetKcal":targetKcal,
            "targetProtein": targetProtein,
            "targetFat":targetFat,
            "targetCarbs":targetCarbs
        };
        fetch("/api/target",{  
            method:"PATCH",
            body:JSON.stringify(addTarget),
            headers:new Headers({
                "content-type":"application/json"
            })
        }).then(function(response){
            return response.json();  
        }).then(function(data){
            if(data.error == true){
                noticeWindow.style.display="block";
                noticeMain.textContent = data.message;  
            }else{
                const targetData = data.data;
                targetInputBlock.style.display="none";
                noTargetData.style.display="none";
                targetBlock.style.display="block";
                targetMacrosValue.style.display="block";
                targetMacrosPercentage.style.display="block";
                targetKcalValue.textContent = targetData.targetKcal;
                targetProteinValue.textContent = targetData.proteinAmount + " g";
                targetFatValue.textContent = targetData.fatAmount + " g";
                targetCarbsValue.textContent = targetData.carbsAmount + " g";
                targetProteinPercentage.textContent = "(" + targetData.targetProtein + "%)";
                targetFatPercentage.textContent = "(" + targetData.targetFat + "%)";
                targetCarbsPercentage.textContent = "(" + targetData.targetCarbs + "%)";
            }
        })
    }
})
