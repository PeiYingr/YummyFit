const changeToSignup=document.querySelector(".changeToSignup");
const changeToSignin=document.querySelector(".changeToSignin");
const signinSection=document.querySelector(".signinSection");
const signupSection=document.querySelector(".signupSection");
const signupNameBlock = document.querySelector(".signupName");
const signupEmailBlock = document.querySelector(".signupEmail");
const signupPasswordBlock = document.querySelector(".signupPassword");
const signinEmailBlock = document.querySelector(".signinEmail");
const signinPasswordBlock = document.querySelector(".signinPassword");

changeToSignup.addEventListener("click", () => {
    signinSection.style.display="none";
    signupSection.style.display="block";
    if(signupResult){
        signupResult.remove();  
    }
    signupNameBlock.value = "";
    signupEmailBlock.value = "";
    signupPasswordBlock.value = "";
})
changeToSignin.addEventListener("click", () => {
    signinSection.style.display="block";
    signupSection.style.display="none";
    if(signinResult){
        signinResult.remove();
    }
    signinEmailBlock.value = "";
    signinPasswordBlock.value = "";
})

// signup API
const signupButton=document.querySelector(".signupButton");
const signupResult=document.createElement("div");
signupResult.setAttribute("class","signupResult");
const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-.]+){1,}$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4,8}$/;
signupButton.addEventListener("click", () => {
    const signupName = document.querySelector(".signupName").value;
    const signupEmail = document.querySelector(".signupEmail").value;
    const signupPassword = document.querySelector(".signupPassword").value;
    if(signupName == "" ||signupEmail == "" || signupPassword == ""){
        signupResult.setAttribute("style","color:#FF0000");        
        signupResult.innerHTML="⚠️ Enter your name, Email and password";    
    }else{
        const emailResult = signupEmail.match(emailRegex);
        const passwordResult = signupPassword.match(passwordRegex);
        if(emailResult == null || passwordResult == null){
            signupResult.setAttribute("style","color:#FF0000");        
            signupResult.innerHTML="⚠️ Invalid Email or password";
        }else{
            const addMember = { 
                "name":signupName,
                "email":signupEmail,
                "password":signupPassword
            };  
            fetch("/api/user",{
                method:"POST",
                body:JSON.stringify(addMember),
                cache:"no-cache",
                headers:new Headers({
                    "content-type":"application/json"
                })
            }).then(function(response){
                return response.json();
            }).then(function(data){ 
                if(data.error == true){
                    signupResult.setAttribute("style","color:#FF0000");        
                    signupResult.innerHTML=data.message; 
                }  
                if(data.ok == true){
                    signupResult.setAttribute("style","color:#008000");           
                    signupResult.innerHTML="Welcome !";  
                    setTimeout(function(){
                        location.href="/";
                    },1000)
                }                     
            })
        }        
    }
    const changeToSignin=document.querySelector(".changeToSignin");
    signupSection.insertBefore(signupResult,changeToSignin);      
})

// signin API
const signinButton=document.querySelector(".signinButton");
const signinResult=document.createElement("div");
signinResult.setAttribute("class","signinResult");
signinButton.addEventListener("click", () => {
    const signinEmail = document.querySelector(".signinEmail").value;
    const signinPassword = document.querySelector(".signinPassword").value;
    if(signinEmail == ""|| signinPassword == ""){
        signinResult.setAttribute("style","color:#FF0000");        
        signinResult.innerHTML="⚠️ Enter your Email and password";
        signinSection.insertBefore(signinResult,changeToSignup);  
    }else{
        const member = { 
            "email":signinEmail,
            "password":signinPassword
        }; 
        fetch("/api/user",{
            method:"PUT",
            body:JSON.stringify(member),
            cache:"no-cache",
            headers:new Headers({
                "content-type":"application/json"
            })
        }).then(function(response){
            return response.json();
        }).then(function(data){   
            if(data.error == true){
                signinResult.setAttribute("style","color:#FF0000");        
                signinResult.innerHTML=data.message;  
                signinSection.insertBefore(signinResult,changeToSignup);  
            }
            if(data.ok == true){
                location.href="/";
            }
        })
    }
})

// get signin status/information API
fetch("/api/user").then(function(response){
    return response.json();
}).then(function(data){
    const userData=data.data;
    if(userData == null){
        return;
    }
    else{
        location.href="/"
    }
});