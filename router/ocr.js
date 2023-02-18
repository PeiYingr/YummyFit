const express = require("express");
const ocrRouter = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const vision = require("@google-cloud/vision");
// Creates a google cloud vision client
const client = new vision.ImageAnnotatorClient({
    keyFilename:"googleCloudVision.json"
});

// 設定 Multer
const upload = multer();

function remove(array, value) {
    const index = array.indexOf(value);
    if (index !== -1) {
        array.splice(index, 1);
    }
};

ocrRouter.post("/", upload.single("image"), async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            // 取得上傳的照片
            const image = req.file;
            if(image == null){
                res.status(400).json({ 			
                    "error": true,
                    "message": "No file selected." 
                });
            }else{
                const imageBuffer = image.buffer
                let name;
                let proValue;
                let fatValue;
                let carbsValue;
                // USA nutrition facts have per serving size
                let servingSize;
                let perServingFat;
                let perServingCarbs;
                let perServingProtein;
                // 使用sharp將照片從buffer轉為file
                sharp(imageBuffer).toFormat('jpeg').toBuffer().then(outputBuffer => {
                    // Output buffer is now a JPEG image
                    client.textDetection(outputBuffer).then((results)=>{
                        const Detection = results[0].textAnnotations;
                        const result = Detection[0].description.split("\n")
                        let resultArray =[]
                        result.forEach((text) => {
                            // 移除每個字串裡可能含有的"|"
                            const textOk = text.replace("|","");
                            resultArray.push(textOk);
                        });
                        const keywords = ["Nutrition", "Amount", "per", "serving", "Total Fat", "Total Carbohydrate", "Protein"];
                        // 找尋resultArray中的字串有無keywords中的關鍵字
                        const includesKeyword = resultArray.some((str) => keywords.some((keyword) => str.includes(keyword)));
                        if (includesKeyword) {
                            // USA nutrition facts
                            resultArray.forEach((x) => {
                                if (x.match(/\((.*?)\)/)) {
                                    gramMatch = x.match(/\((.*?)\)/);
                                    servingSize = gramMatch ? gramMatch[1] : null;    //gramMatch 是 match() 方法回傳的結果，是一個包含匹配到的結果的陣列
                                    if (servingSize){
                                        servingSize = servingSize.replace("g","");
                                    }
                                }
                                if(x.match(/Total Fat (\d+\w+)/)){
                                    fatMatch = x.match(/Total Fat (\d+\w+)/);
                                    perServingFat = fatMatch ? fatMatch[1] : null;
                                    if (servingSize && perServingFat){
                                        perServingFat = perServingFat.replace("g","");
                                        fatValue = Math.round(((perServingFat/servingSize)*100 + Number.EPSILON)* 10) / 10;
                                    }
                                }
                                if (x.match(/Total Carbohydrate (\d+\w+)/)) {
                                    carbsMatch = x.match(/Total Carbohydrate (\d+\w+)/);
                                    perServingCarbs = carbsMatch ? carbsMatch[1] : null;
                                    if (servingSize && perServingCarbs){
                                        perServingCarbs = perServingCarbs.replace("g","");
                                        carbsValue = Math.round(((perServingCarbs/servingSize)*100 + Number.EPSILON)* 10) / 10;
                                    }
                                }
                                if(x.match(/Protein (\d+\w+)/)){
                                    proteinMatch = x.match(/Protein (\d+\w+)/);
                                    perServingProtein = proteinMatch ? proteinMatch[1] : null;
                                    if (servingSize && perServingProtein){
                                        perServingProtein = perServingProtein.replace("g","");
                                        proValue = Math.round(((perServingProtein/servingSize)*100 + Number.EPSILON)* 10) / 10;
                                    }
                                }
                            })
                            response = {
                                "data": {
                                    "name":null,
                                    "proValue":proValue,
                                    "fatValue":fatValue,
                                    "carbsValue":carbsValue
                                }
                            }
                            res.status(200).json(response);
                        }else{
                            // Taiwan nutrition facts
                            //移除array裡的"營養標示"
                            remove(resultArray, "營養標示");
                            const searchKcalText = '熱量';
                            const indexOfKcalText = resultArray.indexOf(searchKcalText);
                            const searchProText= '蛋白質';
                            const indexOfProText = resultArray.indexOf(searchProText);
                            const searchFatText = '脂肪';
                            const indexOfFatText = resultArray.indexOf(searchFatText);
                            const searchCarbsText = '碳水化合物';
                            const indexOfCarbsText = resultArray.indexOf(searchCarbsText);
                            const proKcalGap = indexOfProText - indexOfKcalText;
                            const fatKcalGap = indexOfFatText - indexOfKcalText;
                            const carbsKcalGap = indexOfCarbsText - indexOfKcalText;
                            // *找品名name
                            const regexProductName = /品名:/;
                            resultArray.forEach((x) => {
                                if (x.match(regexProductName)) {
                                    name = x.replace("品名:","");
                                }
                            });
                            if(!name){
                                name = null;
                            }
                            // 找出每100公克或100毫升的index
                            const regexGram = /^每\s*100\s*公克$/;
                            const regexML = /^每\s*100\s*毫升$/
                            let indexOfPerHundredUnit;
                            resultArray.forEach((x) => {
                                if (x.match(regexGram) || x.match(regexML)) {
                                    indexOfPerHundredUnit = resultArray.indexOf(x);
                                }
                            });
                            if(indexOfPerHundredUnit){
                                proValue = resultArray[indexOfPerHundredUnit + 1 + proKcalGap];
                                fatValue = resultArray[indexOfPerHundredUnit  + 1 +fatKcalGap];
                                carbsValue = resultArray[indexOfPerHundredUnit  + 1 + carbsKcalGap];
                            }else{
                                // 找出每100公克或100毫升「大卡值」的index
                                const regexOne = /^\d+(\.\d+)?大卡$/;
                                const regexTwo = /^\d+(\.\d+)?\s大卡$/;
                                let indexOfKcalValue;
                                resultArray.forEach((x) => {
                                    if (x.match(regexOne) || x.match(regexTwo)) {
                                        indexOfKcalValue = resultArray.indexOf(x);
                                    }
                                });
                                if(indexOfKcalValue){
                                    proValue = resultArray[indexOfKcalValue + proKcalGap];
                                    fatValue = resultArray[indexOfKcalValue +fatKcalGap]
                                    carbsValue = resultArray[indexOfKcalValue + carbsKcalGap];
                                }else{
                                    proValue = null;
                                    fatValue = null;
                                    carbsValue = null;
                                }
                            }
                            const regexHaveGrams = /公克/;
                            if(proValue.match(regexHaveGrams)){
                                proValue = proValue.replace("公克","");
                            }
                            if(fatValue.match(regexHaveGrams)){
                                fatValue = fatValue.replace("公克","");
                            }
                            if(carbsValue.match(regexHaveGrams)){
                                carbsValue = carbsValue.replace("公克","");
                            }
                            response = {
                                "data": {
                                    "name":name,
                                    "proValue":proValue,
                                    "fatValue":fatValue,
                                    "carbsValue":carbsValue
                                }
                            }
                            res.status(200).json(response);
                        }
                    })
                })   
            }   
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied.Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
});

module.exports = ocrRouter