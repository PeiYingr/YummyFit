const express = require("express");
const locationRouter = express.Router();
const axios = require("axios");
require("dotenv").config({ path: ".env" });
const googleMapApiKey = process.env.GOOGLE_MAP_API;

// fuzzy match(search) of location
locationRouter.get("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const locationSearchInput = req.query.keyword || "";
            if(locationSearchInput !== ""){
                const config = {
                  method: "get",
                  url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${locationSearchInput}&key=`+ googleMapApiKey,
                };
                let allDataInfo = [];
                let responseData;
                axios(config).then(function (response) {
                    const allData = response.data.results;
                    if(allData[0]){
                        for(let i = 0 ; i < allData.length ; i++){
                            const oneLocationData = {
                                "name": allData[i].name,
                                "address": allData[i].formatted_address,
                                "placeID": allData[i].place_id,
                                "geometry": allData[i].geometry.location,
    
                            }
                            allDataInfo.push(oneLocationData);
                        }
                        responseData = {
                            "data": allDataInfo
                        }
                    }else{
                        responseData= {
                            "data": null
                        }
                    }
                    res.status(200).json(responseData);
                }).catch(function (error) {
                    console.log(error);
                });
            }else{
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter location"
                });  
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
        })
    }
})

module.exports = locationRouter