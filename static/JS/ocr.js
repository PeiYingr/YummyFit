const foodFile = document.querySelector(".foodFile");

// OCR for food name or macros detection
foodFile.addEventListener("change", () => {
    const foodInfoFile = foodFile.files[0];
    let formData = new FormData();
    formData.append("image", foodInfoFile)
    fetch("/api/ocr",{
        method:"POST",
        body:formData            
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (data.error == true){
            noticeWindow.style.display="block";
            noticeMain.textContent = data.message;
        }else{
            const foodInfo = data.data;
            let protein = foodInfo.proValue;
            let fat = foodInfo.fatValue;
            let carbs = foodInfo.carbsValue;
            const regexHaveGrams = /公克/;
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
                if(protein.match(regexHaveGrams)){
                    protein = protein.replace("公克","");
                }
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
                if(fat.match(regexHaveGrams)){
                    fat = fat.replace("公克","");
                }
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
                if(carbs.match(regexHaveGrams)){
                    carbs = carbs.replace("公克","");
                }
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