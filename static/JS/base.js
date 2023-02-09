const title = document.querySelector(".title");
const signoutText = document.querySelector(".signoutText");
const foodDiary = document.querySelector(".diary");
const memberCenter = document.querySelector(".memberCenter");
const memberCenterFrame = document.querySelector(".memberCenterFrame");
const memberInfo = document.querySelector(".memberInfo");
const noticeWindow = document.querySelector(".noticeWindow");
const noticeSection = document.querySelector(".noticeSection");
const noticeMain = document.querySelector(".noticeMain");
const closeIcon = document.querySelector(".closeIcon");
let memberCenterFrameStatus = 0 // status = close
// click memberCenter(text) : show/hide memberCenterFrame

title.addEventListener("click", () =>{
    location.href="/";
})

memberInfo.addEventListener("click", () =>{
    location.href="/member";
})
foodDiary.addEventListener("click", () =>{
    location.href="/";
})

closeIcon.addEventListener("click", () =>{
    noticeWindow.style.display="none";
})

memberCenter.addEventListener("click", () =>{
    if(memberCenterFrameStatus == 0){
        memberCenterFrame.style.display = "flex";
        memberCenterFrameStatus = 1;
    }else{
        memberCenterFrame.style.display = "none";
        memberCenterFrameStatus = 0;     
    }
})

// get signin status/information API
fetch("/api/user").then(function(response){
    return response.json();
}).then(function(data){
    if(data.error == true){
        location.href="/sign"
    }else{
        const userData = data.data;
        return;
    }
});

 // signout API
 signoutText.addEventListener("click", () =>{
    fetch("/api/user",{
        method:"DELETE"
    }).then(function(response){
        return response.json();
    }).then(function(data){
        location.reload();
    });
 })