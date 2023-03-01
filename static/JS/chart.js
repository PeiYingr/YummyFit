const ctx = document.getElementById("myChart");

const data = {
  labels: [],
  datasets: [{
      data: [],
      backgroundColor: [
      "rgb(255, 137, 0)",
      "rgb(121, 87, 61)",
      "rgb(204, 112, 102)"
      ],
      borderWidth: 3,
      hoverOffset: 10,
  }]
};

const config = {
  type: "pie",
  data: data,
  options: {
    responsive: true, // 設置圖表為響應式，根據屏幕窗口變化而變化
    maintainAspectRatio: false,// 保持圖表原有比例
    layout: {
      padding: {
        left: 90,
        right: 90,
        top: 10,
        bottom: 60
      }
    },
    plugins: {
      title: {
        display: true, 
        text: "Macros percentages for Daily Intake",
        color: "#7f5539", 
        font: {
          size: 24,
          weight:600,
          lineHeight:1.8
        },
        padding:{
          top: 40,
          bottom: 0
        },
      },
      legend: {
        borderWidth:1,
        position:"bottom",
        onClick: null,
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

const myChart = new Chart(ctx, config);

async function updatePieChart(dailyIntakeData){
  myChart.data.labels = ["Protein(%)", "Fat(%)" , "Carbs(%)"]
  myChart.data.datasets[0].data = [dailyIntakeData.proteinPercentage, dailyIntakeData.fatPercentage, dailyIntakeData.carbsPercentage]
  myChart.update()
};