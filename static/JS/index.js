const date = document.querySelector(".date")
const calendar = document.querySelector(".calendar")
const calendarInput = document.querySelector('input[type="date"]');
const breakfast = document.querySelector(".breakfast")
const lunch = document.querySelector(".lunch")
const dinner = document.querySelector(".dinner")
const snacks = document.querySelector(".snacks")
const dailyIntake = document.querySelector(".dailyIntake")
const foodInput = document.querySelector(".foodInput")
const searchResultBox =  document.querySelector(".searchResultBox");
const gramInput = document.querySelector(".gramInput")
const add = document.querySelector(".add")
const records = document.querySelector(".records")
const noRecord = document.querySelector(".noRecord")
const mealRecordFrame = document.querySelector(".mealRecordFrame")
const dailyRecordFrame = document.querySelector(".dailyRecordFrame")
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
const goAddTarget = document.querySelector(".goAddTarget");
const dailyKcal = document.querySelector(".dailyKcal")
const dailyProtein = document.querySelector(".dailyProtein")
const dailyFat = document.querySelector(".dailyFat")
const dailyCarbs = document.querySelector(".dailyCarbs")
const dailyProteinPercentage = document.querySelector(".dailyProteinPercentage")
const dailyFatPercentage = document.querySelector(".dailyFatPercentage")
const dailyCarbsPercentage = document.querySelector(".dailyCarbsPercentage")
const newFoodNameInput = document.querySelector(".newFoodNameInput");
const newFoodProteinInput = document.querySelector(".newFoodProteinInput");
const newFoodFatInput = document.querySelector(".newFoodFatInput");
const newFoodCarbsInput = document.querySelector(".newFoodCarbsInput");
const addNewFoodButton = document.querySelector(".addNewFoodButton");
const addNewFoodResult = document.querySelector(".addNewFoodResult");
const searchOwnFoodButton = document.querySelector(".searchOwnFoodButton");
const ownFoodFrame = document.querySelector(".ownFoodFrame");
const closeOwnFoodFrame = document.querySelector(".closeOwnFoodFrame");
const ownFoodList = document.querySelector(".ownFoodList");
const noOwnFood = document.querySelector(".noOwnFood");
const pieChart = document.querySelector("#myChart");
const noChart = document.querySelector(".noChart");
let chooseIntakeMeal = "breakfast"; //default

const today = new Date();
const todayDate = today.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
const dateText=document.createTextNode(todayDate);
date.appendChild(dateText);

// convert to isoString(YYYY-MM-DD Format)
const timezoneOffset = today.getTimezoneOffset();
// timezoneOffset = -480hr
const correctedDate = new Date(today.getTime() - timezoneOffset * 60 * 1000);
const isoString = correctedDate.toISOString().substring(0, 10);
calendarInput.value = isoString;
// convert to timestamp format
let chooseIntakeDate = calendarInput.value;
let convertDateFormat = new Date(chooseIntakeDate);
let timestamp = convertDateFormat.getTime();

// show meal intake data
function showMealIntake(userIntakeData){
    const oneRecord = document.createElement("div");
    oneRecord.setAttribute("class","oneRecord");
    const food = document.createElement("div");
    food.setAttribute("class","food");
    food.textContent = userIntakeData.foodName;
    oneRecord.appendChild(food);
    const amount = document.createElement("div");
    amount.setAttribute("class","amount");
    amount.textContent = userIntakeData.amount;
    oneRecord.appendChild(amount);
    const protein = document.createElement("div");
    protein.setAttribute("class","protein");
    protein.textContent = userIntakeData.protein;
    oneRecord.appendChild(protein);
    const fat = document.createElement("div");
    fat.setAttribute("class","fat");
    fat.textContent = userIntakeData.fat;
    oneRecord.appendChild(fat);
    const carbs = document.createElement("div");
    carbs.setAttribute("class","carbs");
    carbs.textContent = userIntakeData.carbs;
    oneRecord.appendChild(carbs);
    const kcal = document.createElement("div");
    kcal.setAttribute("class","kcal");
    kcal.textContent = userIntakeData.kcal;
    oneRecord.appendChild(kcal);
    const deleteIcon = document.createElement("div");
    deleteIcon.setAttribute("class","deleteIcon");
    const deleteIconImg = document.createElement("img");
    deleteIconImg.setAttribute("src","/Images/delete.png");
    deleteIcon.appendChild(deleteIconImg);
    oneRecord.appendChild(deleteIcon);
    records.appendChild(oneRecord);
};

// delete intake food
function deleteOneIntakeRecords(){
    const oneRecords = document.querySelectorAll(".oneRecord")
    oneRecords.forEach((deleteOneRecord) =>{
        const recordDeleteIcon = deleteOneRecord.querySelector(".deleteIcon");
        recordDeleteIcon.addEventListener("click",() => {
            const food = deleteOneRecord.querySelector(".food").textContent;
            const amount = deleteOneRecord.querySelector(".amount").textContent;
            const deleteFood = {
                "meal":chooseIntakeMeal,
                "foodName":food,
                "date":timestamp,
                "amount":amount
            };
            fetch("/api/intake",{
                method:"DELETE",
                body:JSON.stringify(deleteFood),
                headers:new Headers({
                    "content-type":"application/json"
                })
            }).then(function(response){
                return response.json();  
            }).then(function(data){
                if(data.ok == true){
                    deleteOneRecord.remove();
                    const haveRecord = document.querySelector(".oneRecord")
                    if (haveRecord == null){
                        records.style.display="none";
                        noRecord.style.display="block";
                    }
                }else{
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message; 
                }
            })
        })
    })
}

// get meals intake data
async function getMealIntakeData(){
    const response = await fetch(`/api/intake?meal=${chooseIntakeMeal}&date=${timestamp}`);
    const data = await response.json();
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;  
    }else if (data.data == null){
        dailyRecordFrame.style.display="none";
        mealRecordFrame.style.display="block";
        noRecord.style.display="block";
        records.style.display="none";
    }else{
        const userIntakeData = data.data;
        dailyRecordFrame.style.display="none";
        mealRecordFrame.style.display="block";
        noRecord.style.display="none";
        records.style.display="block";
        records.innerHTML="";
        for(i=0; i<userIntakeData.length; i++){
            showMealIntake(userIntakeData[i]);
        }
        deleteOneIntakeRecords();
    } 
}

// get daily intake data
async function getDailyIntakeData(){
    const response = await fetch(`/api/intake/daily?date=${timestamp}`)
    const data = await response.json();
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;  
    }else if (data.data == null){
        mealRecordFrame.style.display = "none";
        dailyRecordFrame.style.display ="flex";
        pieChart.style.display = "none";
        noChart.style.display = "block";
        await getTargetData();
        dailyKcal.textContent = "0";
        dailyProtein.textContent = "0";
        dailyFat.textContent = "0";
        dailyCarbs.textContent = "0";
        dailyProteinPercentage.textContent = "(0%)";
        dailyFatPercentage.textContent = "(0%)";
        dailyCarbsPercentage.textContent = "(0%)";
    }else{
        const dailyIntakeData = data.data;
        mealRecordFrame.style.display="none";
        dailyRecordFrame.style.display="flex";
        noChart.style.display = "none";
        pieChart.style.display = "block";
        await updateChart(dailyIntakeData);
        await getTargetData();
        dailyKcal.textContent = dailyIntakeData.totalKcal;
        dailyProtein.textContent = dailyIntakeData.totalProtein;
        dailyFat.textContent = dailyIntakeData.totalFat;
        dailyCarbs.textContent = dailyIntakeData.totalCarbs;
        dailyProteinPercentage.textContent = "(" + dailyIntakeData.proteinPercentage + "%)";
        dailyFatPercentage.textContent = "(" + dailyIntakeData.fatPercentage + "%)";
        dailyCarbsPercentage.textContent = "(" + dailyIntakeData.carbsPercentage + "%)";
    }
}

// get user nutrients target
async function getTargetData(){
    const response = await fetch("/api/target");
    const data = await response.json();
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
        targetProteinValue.textContent = targetData.proteinAmount;
        targetFatValue.textContent = targetData.fatAmount;
        targetCarbsValue.textContent = targetData.carbsAmount;
        targetProteinPercentage.textContent = "(" + targetData.targetProtein + "%)";
        targetFatPercentage.textContent = "(" + targetData.targetFat + "%)";
        targetCarbsPercentage.textContent = "(" + targetData.targetCarbs + "%)";
    }
}

// delete user's own food data
function deleteOwnFood(){
    const ownFoods = document.querySelectorAll(".ownFood")
    ownFoods.forEach((deleteOneOwnFood) =>{
        const deleteOwnFoodIcon = deleteOneOwnFood.querySelector(".deleteOwnFoodIcon");
        deleteOwnFoodIcon.addEventListener("click",() => {
            const ownFoodName = deleteOneOwnFood.querySelector(".ownFoodName").textContent;
            const deleteOwnFood = {
                "foodName":ownFoodName,
            };
            fetch("/api/food/userfood",{
                method:"DELETE",
                body:JSON.stringify(deleteOwnFood),
                headers:new Headers({
                    "content-type":"application/json"
                })
            }).then(function(response){
                return response.json();  
            }).then(function(data){
                if(data.ok == true){
                    deleteOneOwnFood.remove();
                    const haveOwnFood = document.querySelector(".ownFood")
                    if (haveOwnFood == null){
                        ownFoodList.style.display="none";
                        noOwnFood.style.display="block";
                    }
                }else{
                    noticeWindow.style.display="block";
                    noticeMain.textContent = data.message; 
                }
            })
        })
    })
}

// search own food
async function getOwnFoodData(){
    const response = await fetch("/api/food/userfood");
    const data = await response.json();
    if(data.error == true){
        noticeWindow.style.display="block";
        noticeMain.textContent = data.message;  
    }else if(data.data == null){
        ownFoodList.style.display="none";
        noOwnFood.style.display="block";
    }else{
        noOwnFood.style.display="none";
        ownFoodList.style.display="block";
        const ownFoodData = data.data;
        ownFoodList.innerHTML="";
        for(let i=0;i<ownFoodData.length;i++){
            const ownFood = document.createElement("div");
            ownFood.setAttribute("class","ownFood");
            const ownFoodName = document.createElement("div");
            ownFoodName.setAttribute("class","ownFoodName");
            ownFoodName.textContent = ownFoodData[i].name;
            ownFood.appendChild(ownFoodName);
            const ownFoodProtein = document.createElement("div");
            ownFoodProtein.setAttribute("class","ownFoodProtein");
            ownFoodProtein.textContent = ownFoodData[i].protein;
            ownFood.appendChild(ownFoodProtein);
            const ownFoodFat = document.createElement("div");
            ownFoodFat.setAttribute("class","ownFoodFat");
            ownFoodFat.textContent = ownFoodData[i].fat;
            ownFood.appendChild(ownFoodFat);
            const ownFoodCarbs = document.createElement("div");
            ownFoodCarbs.setAttribute("class","ownFoodCarbs");
            ownFoodCarbs.textContent = ownFoodData[i].carbs;
            ownFood.appendChild(ownFoodCarbs);
            const deleteOwnFoodIcon = document.createElement("div");
            deleteOwnFoodIcon.setAttribute("class","deleteOwnFoodIcon");
            const deleteOwnFoodIconImg = document.createElement("img");
            deleteOwnFoodIconImg.setAttribute("src","/Images/delete.png");
            deleteOwnFoodIcon.appendChild(deleteOwnFoodIconImg);
            ownFood.appendChild(deleteOwnFoodIcon);
            ownFoodList.appendChild(ownFood);
        };
        deleteOwnFood();      
    }
}

// get meals intake data (default:breakfast)
getMealIntakeData();
// get own food data 
getOwnFoodData();

calendarInput.addEventListener("change", () => {
    chooseIntakeDate = calendarInput.value;
    convertDateFormat = new Date(chooseIntakeDate);
    localeDateString = convertDateFormat.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
    // put date text content on the right side of calender 
    date.textContent = localeDateString;
    // convert to timestamp format
    timestamp = convertDateFormat.getTime();
    if (chooseIntakeMeal == "dailyIntake"){
        getDailyIntakeData();
    }else{
        getMealIntakeData();
        getMealPhotos();     
    }
})

foodInput.addEventListener("blur",() => {
    setTimeout(() => {
        searchResultBox.style.display="none";
    },150)
})

foodInput.addEventListener("click", () => {
  foodInput.select();
});

let timer;
// fuzzy match(search) of public & own food
foodInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        const foodsearch = foodInput.value;
        if(foodsearch.length === 0){
            searchResultBox.style.display="none";
        }else{
            fetch(`/api/food?keyword=${foodsearch}`).then(function(response){  //method:"GET"
                return response.json();  
            }).then(function(data){
                const searchResults = document.querySelectorAll(".searchResults");
                if(searchResults[0]){
                    searchResults.forEach(element => {
                        element.remove();
                    });          
                };
                searchResultBox.style.display="block";
                if(data.error == true){
                    const searchResult = document.createElement("div");
                    searchResult.setAttribute("class","searchResults");
                    const searchResultText = document.createTextNode(data.message);
                    searchResult.appendChild(searchResultText);
                    searchResultBox.appendChild(searchResult);
                }else{
                    for(let i=0;i<data.length;i++){
                        const searchFoodData = data[i];
                        const searchResult = document.createElement("div");
                        searchResult.setAttribute("class","searchResults");
                        const searchResultText = document.createTextNode(searchFoodData.name);
                        searchResult.appendChild(searchResultText);
                        searchResultBox.appendChild(searchResult); 
                    };         
                };
                const searchResultsLast = document.getElementsByClassName("searchResults");
                for(let i=0;i<searchResultsLast.length;i++){
                    if(searchResultsLast[i].textContent == "No Data"){
                        searchResultsLast[i].style.cursor="not-allowed";
                    }else{
                        searchResultsLast[i].addEventListener("click", () => {
                            foodInput.value = searchResultsLast[i].textContent;
                            searchResultBox.style.display="none";
                        });                
                    }
                };
            });  
        }
    }, 400);
});

// add meal intake
add.addEventListener("click", () => {
    const food = foodInput.value;
    const amount = gramInput.value;
    if(food == ""){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter name of food."; 
    }else if(amount == "" || Number(amount)<0){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter right amount of food."; 
    }else{
        const chooseIntakeDate = calendarInput.value;
        const convertDateFormat = new Date(chooseIntakeDate);
        const timestamp = convertDateFormat.getTime();
        // const date = new Date(timestamp).toDateString();
        const addIntake = { 
            "date":timestamp,
            "meal": chooseIntakeMeal,
            "foodName":food,
            "amount":amount
        };
        fetch("/api/intake",{  
            method:"POST",
            body:JSON.stringify(addIntake),
            headers:new Headers({
                "content-type":"application/json"
            })
        }).then(function(response){
            return response.json();  
        }).then(function(data){
            if(data.error == true){
                noticeWindow.style.display="block";
                noticeMain.textContent = data.message;  
            }else if (data.data == null){
                noRecord.style.display="block";
                records.style.display="none";
            }else{
                foodInput.value = "";
                gramInput.value = "";
                searchResultBox.style.display="none";
                const userIntakeData = data.data;
                dailyRecordFrame.style.display="none";
                mealRecordFrame.style.display="block";
                noRecord.style.display="none";
                records.style.display="block";
                records.innerHTML="";
                for(i=0; i<userIntakeData.length; i++){
                    showMealIntake(userIntakeData[i]);
                }
                deleteOneIntakeRecords();
            }
        })
    }
})

breakfast.addEventListener("click", () => {
    breakfast.style.color = "#922c21";
    breakfast.style.borderBottom = "2px solid #7f5539";
    lunch.style.color="#bf9d7e";
    lunch.style.borderBottom = "none";
    dinner.style.color="#bf9d7e";
    dinner.style.borderBottom = "none";
    snacks.style.color="#bf9d7e";
    snacks.style.borderBottom = "none";
    dailyIntake.style.color="#bf9d7e";
    dailyIntake.style.borderBottom = "none";
    chooseIntakeMeal = "breakfast";
    getMealIntakeData();
    getMealPhotos();
})

lunch.addEventListener("click", () => {
    breakfast.style.color = "#bf9d7e";
    breakfast.style.borderBottom = "none";
    lunch.style.color="#922c21";
    lunch.style.borderBottom = "2px solid #7f5539";
    dinner.style.color="#bf9d7e";
    dinner.style.borderBottom = "none";
    snacks.style.color="#bf9d7e";
    snacks.style.borderBottom = "none";
    dailyIntake.style.color="#bf9d7e";
    dailyIntake.style.borderBottom = "none";
    chooseIntakeMeal = "lunch";
    getMealIntakeData();
    getMealPhotos();
})

dinner.addEventListener("click", () => {
    breakfast.style.color = "#bf9d7e";
    breakfast.style.borderBottom = "none";
    lunch.style.color="#bf9d7e";
    lunch.style.borderBottom = "none";
    dinner.style.color="#922c21";
    dinner.style.borderBottom = "2px solid #7f5539";
    snacks.style.color="#bf9d7e";
    snacks.style.borderBottom = "none";
    dailyIntake.style.color="#bf9d7e";
    dailyIntake.style.borderBottom = "none";
    chooseIntakeMeal = "dinner";
    getMealIntakeData();
    getMealPhotos();
})

snacks.addEventListener("click", () => {
    breakfast.style.color = "#bf9d7e";
    breakfast.style.borderBottom = "none";
    lunch.style.color="#bf9d7e";
    lunch.style.borderBottom = "none";
    dinner.style.color="#bf9d7e";
    dinner.style.borderBottom = "none";
    snacks.style.color="#922c21";
    snacks.style.borderBottom = "2px solid #7f5539";
    dailyIntake.style.color="#bf9d7e";
    dailyIntake.style.borderBottom = "none";
    chooseIntakeMeal = "snacks";
    getMealIntakeData();
    getMealPhotos();
})

dailyIntake.addEventListener("click", () => {
    breakfast.style.color = "#bf9d7e";
    breakfast.style.borderBottom = "none";
    lunch.style.color="#bf9d7e";
    lunch.style.borderBottom = "none";
    dinner.style.color="#bf9d7e";
    dinner.style.borderBottom = "none";
    snacks.style.color="#bf9d7e";
    snacks.style.borderBottom = "none";
    dailyIntake.style.color="#922c21";
    dailyIntake.style.borderBottom = "2px solid #7f5539";
    chooseIntakeMeal = "dailyIntake";
    getDailyIntakeData();
})

goAddTarget.addEventListener("click", () => {
    location.href="/member";
})

searchOwnFoodButton.addEventListener("click", () => {
    noticeWindow.style.display = "block";
    noticeSection.style.display = "none";
    ownFoodFrame.style.display = "block";
})

closeOwnFoodFrame.addEventListener("click", () => {
    noticeWindow.style.display = "none";
    noticeSection.style.display = "block";
    ownFoodFrame.style.display = "none";
})

// add new food(user's own food)
addNewFoodButton.addEventListener("click", ()=> {
    const newFoodName = newFoodNameInput.value;
    const newFoodProtein = newFoodProteinInput.value;
    const newFoodFat = newFoodFatInput.value;
    const newFoodCarbs =newFoodCarbsInput.value;
    if(newFoodName == ""){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter name of new food."; 
    }else if(newFoodProtein == ""){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter protein of new food."; 
    }else if(newFoodFat == ""){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter fat of new food."; 
    }else if(newFoodCarbs == ""){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter carbs of new food."; 
    }else if(isNaN(newFoodProtein) || isNaN(newFoodFat) || isNaN(newFoodCarbs)){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Please enter correct amount."; 
    }else if(Number(newFoodProtein)<0 || Number(newFoodFat)<0 || Number(newFoodCarbs)<0){
        noticeWindow.style.display="block";
        noticeMain.textContent = "Enter correct amount of nutrients."; 
    }else{
        const addNewFood = { 
            "name":newFoodName,
            "protein": newFoodProtein,
            "fat":newFoodFat,
            "carbs":newFoodCarbs
        };
        fetch("/api/food/userfood",{  
            method:"POST",
            body:JSON.stringify(addNewFood),
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
                addNewFoodButton.style.display="none";
                addNewFoodResult.style.display="block";
                setTimeout(() => {
                    addNewFoodButton.style.display="block";
                    addNewFoodResult.style.display="none";
                    newFoodNameInput.value = "";
                    newFoodProteinInput.value ="";
                    newFoodFatInput.value = "";
                    newFoodCarbsInput.value = "";
                },1000)
                getOwnFoodData();
            }
        })
    }
})