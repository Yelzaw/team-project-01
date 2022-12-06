$(document).ready(function(){
     const searches = JSON.parse(window.localStorage.getItem("search")) || [];
     // const input = $('#input');
     // const inputValue = input[0].value;
     console.log(searches)
          for (let i =0; i<searches.length; i++){
               const newPreviosSearch = `<button id="eachPreviousSearch${i}" class="eachPreviousSearch">${searches[i]}</button>`
               $('#previos-search').prepend(newPreviosSearch);
               $(`#eachPreviousSearch${i}`).on('click', function(){
                    inputValue = searches[i]
                    callCountryData(inputValue)
                    var newSearch = inputValue;
                    searches.push(newSearch);
                    window.localStorage.setItem("search", JSON.stringify(searches));
                    
               })
          } 
     console.log('connected');
     var latitude = 45.42;
     var longtitude = -75.7;
     initMap();
     $('#submit-btn').on('click', function(){
          console.log('yeah!!')   
          const input = $('#input');
          const inputValue = input[0].value;
          callCountryData(inputValue);
          var newSearch = inputValue;
          searches.push(newSearch);
          window.localStorage.setItem("search", JSON.stringify(searches));
          console.log(inputValue);
          $('#input').val("");//clean input space 
     })
     
     //Calendar
     function displayTime(){
          var reformatDate = dayjs().format('dddd, MMMM D');
          $('#calendar-holder').text(reformatDate);
          setTimeout(displayTime,1000);
     }
     displayTime()
     //calendar end

     // COUNTRY DATA 
     
     var currencyCode = "";
     var currencyName = "";
     var compareCurrency = "CAD";
     var compareName = "Canadian dollar";
     var capitalName = ""; // the name of Capital of country to link weather
     var exchangeInfo = document.querySelector('#today-rate');
     
     function callCountryData(input){
     //call restcountries.com api
     //to get country data, currency code,currency name and counter check input with country name          
          
          exchangeInfo.innerHTML=""; //to make sure there is no data from previous search
          if (input=="canada"){
               compareCurrency = "USD";
               compareName = "United State dollar";
          }

          var country= "https://restcountries.com/v3.1/name/"+input+"?fullText=true"; //API link to get country information
               fetch(country)
                    .then(function(response){
                         if(response.ok){
                              response.json().then(function(data){
                                   console.log(data);//JSON data to show in console
                                   capitalName = data[0].capital[0]; // Result of Capital Name <----result to link weather
                                   $('#capital-name').text("Capital City: "+capitalName);
                                   latitude = data[0].capitalInfo.latlng[0];                                   
                                   longtitude = data[0].capitalInfo.latlng[1];                  
                                   currencyCode = (Object.keys(data[0].currencies))[0];
                                   currencyName = (Object.values(data[0].currencies))[0].name;
                                   $('#currency').attr('style','border-color:grey');                                   
                                   $("#today-rate").siblings("h6").text("Today Exchange Rate");                                   
                                   $('#country-name').attr("style","padding:15px");

                                   currencyExchange();
                                   wikipediaBlurb(input);// <-----link to wikipedia function
                                   // <----- can place weather function link here
                                   initMap();
                              })
                         } else {
                              $('#country-name').attr("style","font-size:20px");
                              $('#country-name').text("Please enter correct country name. Thanks.");
                              }      
                    })
                    .catch(error => console.log('error', error)); 
     }    

     // CURRENCY EXCHANGE RATE
     function currencyExchange(){          
     // new exchange link   
          var key = "9d764e23d7588b589becfa68e6021ab75a789334";

          const url1 =  "https://api.getgeoapi.com/v2/currency/convert?api_key="+key+"&from="+compareCurrency+"&to="+currencyCode+"&amount=1&format=json"

          $.getJSON(url1, function (data) {
               console.log(data);
               var resultLocalUsd = (Object.values(data.rates))[0].rate;
               var showResult = document.createElement("p");
               showResult.textContent="1 "+currencyName+" = "+resultLocalUsd+" "+compareName;
               exchangeInfo.appendChild(showResult);

               const url2 =  "https://api.getgeoapi.com/v2/currency/convert?api_key="+key+"&from="+currencyCode+"&to="+compareCurrency+"&amount=1&format=json"

               $.getJSON(url2, function (data) {
                    console.log(data);
                    var resultLocalUsd = (Object.values(data.rates))[0].rate;
                    var showResult = document.createElement("p");
                    showResult.textContent="1 "+compareName+" = "+resultLocalUsd+" "+currencyName;
                    exchangeInfo.appendChild(showResult);
               });
          });
     }
     // END OF CURRENCY EXCHANGE RATE

     // Wikipedia blurbs
     function wikipediaBlurb(input){
          var wikiUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&exsentences=5&titles="+input;
          var wikiInfo = document.querySelector('#history');
          wikiInfo.innerHTML=""; //to make sure there is no data from previous search

          fetch(wikiUrl)
               .then(function(response){
                    if(response.ok){
                         response.json().then(function(data){
                              console.log(data);//JSON data to show in console
                              var page = data.query.pages;
                              var pageId = Object.keys(page)[0];
                              var blurb = page[pageId].extract;
                              $('#country-name').text(page[pageId].title);//Format country name to formal
                              console.log(blurb);
                              var showResult = document.createElement("p");
                              showResult.textContent=blurb;
                              wikiInfo.appendChild(showResult);
                         })
                    }
               })
               .catch(error => console.log('error', error));
     }
     // END OF Wikipedia blurbs
     
     // MAP OF CAPITAL CITY
     var map;
     function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
          center: {lat:latitude, lng:longtitude},
          zoom: 6
          });
     }
     // END OF MAP
     window.onload = callCountryData("canada"); // <---- default country to load, keep commented unless testing or deploying to avoid API call limit
})