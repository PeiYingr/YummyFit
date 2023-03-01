const weekKcalButton = document.querySelector(".weekKcalButton");
const weekMarcosButton = document.querySelector(".weekMarcosButton");
const weeklyIntakeCtx = document.getElementById("weekChart");

Chart.defaults.font.size = 14;
Chart.defaults.borderColor = "#bf9d7e"
Chart.defaults.color = "#0d1518";

const weeklyIntakeConfig = {
    type: "line",
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true, // 設置圖表為響應式，根據屏幕窗口變化而變化
        maintainAspectRatio: false,// 保持圖表原有比例
        layout: {
        padding: {
            left: 50,
            right: 50,
            top: 10,
            }
        },
        scales: {
            y:{
                min:0, 
            }
        },
        plugins: {
        title: {
            display: true, 
            text: "Weekly Intake",
            color: "#7f5539",
            align: "start",
            backgroundColor:"rgb(255, 137, 0)",
            font: {
            size: 20,
            weight:600,
            lineHeight:1.8
            },
            padding:{
            bottom: 30
            },
        },
        legend: {
            borderWidth:1,
            position:"bottom",
            // onClick: null,
            labels: {
            boxHeight:500,
            padding:30,
            color: "#711c14",
            font: {
                size: 14,
                weight:500,
            },
            usePointStyle:true
            }
        }      
        }
    }
};

const weekKcalDataSets = [
    {
        label: "Calories",
        borderColor: "rgb(146, 44, 33)",
        pointBackgroundColor: "rgb(146, 44, 33)",
        backgroundColor: "rgb(146, 44, 33)",
        borderWidth: 2,
        data: [],
        tension: 0.4
    },
]

const weekMarcosDataSets = [
    {
        label: "Protein(%)",
        borderColor: "rgb(255, 137, 0)",
        pointBackgroundColor: "rgb(255, 137, 0)",
        backgroundColor: "rgb(255, 137, 0)",
        borderWidth: 2,
        data: [],
        tension: 0.4
    },
    {
        label: "Fat(%)",
        borderColor: "rgb(121, 87, 61)",
        pointBackgroundColor: "rgb(121, 87, 61)",
        backgroundColor: "rgb(121, 87, 61)",
        borderWidth: 2,
        data: [],
        tension: 0.4
    },
    {
        label: "Carbs(%)",
        borderColor: "rgb(204, 112, 102)",
        pointBackgroundColor: "rgb(204, 112, 102)",
        backgroundColor: "rgb(204, 112, 102)",
        borderWidth: 2,
        data: [],
        tension: 0.4
    }
]

const weeklyIntakeChart = new Chart(weeklyIntakeCtx, weeklyIntakeConfig);

weekKcalButton.addEventListener("click", () => {
    weekKcalButton.style.display = "none";
    weekMarcosButton.style.display = "block";
    updateWeekKcalChart(weekIntakeData);
})

weekMarcosButton.addEventListener("click", () => {
    weekMarcosButton.style.display = "none";
    weekKcalButton.style.display = "block";
    updateWeekMarcosChart(weekIntakeData);
})

async function updateWeekMarcosChart(weekIntakeData){
    weeklyIntakeChart.data.labels = weekIntakeData.weekDates;
    weeklyIntakeChart.data.datasets = weekMarcosDataSets;
    weeklyIntakeChart.data.datasets[0].data = weekIntakeData.weekProteinPercentage;
    weeklyIntakeChart.data.datasets[1].data = weekIntakeData.weekFatPercentage;
    weeklyIntakeChart.data.datasets[2].data = weekIntakeData.weekCarbsPercentage;
    weeklyIntakeChart.update();
};

async function updateWeekKcalChart(weekIntakeData){
    weeklyIntakeChart.data.labels = weekIntakeData.weekDates;
    weeklyIntakeChart.data.datasets = weekKcalDataSets;
    weeklyIntakeChart.data.datasets[0].data = weekIntakeData.weekKcal;
    weeklyIntakeChart.update();
};