const foodFile = document.querySelector(".foodFile");
const newFoodInfoInput = document.querySelector(".newFoodInfoInput");
const newFoodInfoInputLoading = document.querySelector(".newFoodInfoInputLoading");
const notice = document.querySelector(".notice");

// OCR for food name or macros detection
foodFile.addEventListener("change", () => {
    const foodInfoFile = foodFile.files[0];
    newFoodInfoInput.style.display="none";
    notice.style.display="none";
    newFoodInfoInputLoading.style.display="block";
    let formData = new FormData();
    formData.append("image", foodInfoFile)
    fetch("/api/ocr",{
        method:"POST",
        body:formData            
    }).then((response) => {
        return response.json();
    }).then((data) => {
        newFoodInfoInputLoading.style.display="none";
        notice.style.display="flex";
        newFoodInfoInput.style.display="block";
        if (data.error == true){
            noticeWindow.style.display="block";
            noticeMain.textContent = data.message;
        }else{
            const foodInfo = data.data;
            let protein = foodInfo.proValue;
            let fat = foodInfo.fatValue;
            let carbs = foodInfo.carbsValue;
            if (foodInfo.name){
                newFoodNameInput.value = foodInfo.name;
            }else{
                newFoodNameInput.style.color = "#FF0000";
                newFoodNameInput.value = "Can't detect";
                setTimeout(() => {
                    newFoodNameInput.style.color = "black";
                    newFoodNameInput.value = "";
                },1000)
            };
            if (protein){
                newFoodProteinInput.value = protein;
            }else{
                newFoodProteinInput.style.color = "#FF0000";
                newFoodProteinInput.value = "Can't detect";
                setTimeout(() => {
                    newFoodProteinInput.style.color = "black";
                    newFoodProteinInput.value = "";
                },1000)
            };
            if (fat){
                newFoodFatInput.value = fat;
            }else{
                newFoodFatInput.style.color = "#FF0000";
                newFoodFatInput.value = "Can't detect";
                setTimeout(() => {
                    newFoodFatInput.style.color = "black";
                    newFoodFatInput.value = "";
                },1000)
            };
            if (carbs){
                newFoodCarbsInput.value = carbs;
            }else{
                newFoodCarbsInput.style.color = "#FF0000";
                newFoodCarbsInput.value = "Can't detect";
                setTimeout(() => {
                    newFoodCarbsInput.style.color = "black";
                    newFoodCarbsInput.value = "";
                },1000)
            };
            foodFile.value = "";          
        }
    })
});