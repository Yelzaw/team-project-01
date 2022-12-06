
$(document).ready(function(){
    console.log('connected');
    // Save search setup
    //localStorage.clear();
    //let searchHistory = localStorage.getItem('searchHistory') ? JSON.parse(localStorage.getItem('searchHistory')) : [];
    $('#submit-btn').on('click', function(){
         console.log('yeah!!')   
         const input = $('#input');
         const inputValue = input[0].value;
         $('#input').val("");//clean input space         
         //console.log(inputValue);
         callCountryData(inputValue);  
         // Save previous search
         //searchHistory.push(inputValue);
         //localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
         //console.log(searchHistory);
         // still need to display previous search, allow user to click
    })

     // Store the search history in array, and store in local
     var countryList = [];

     function storeCountryName(name) {
          if (!countryList.includes(name)){
          countryList.push(name);
          localStorage.setItem("countryList", JSON.stringify(countryList));
          }
     }
     // show the city name of search history from array
     var searchHistoryListEl = document.querySelector('#previos-search');
     function renderCountryList(){
          if (countryList.length!==0){
          $('#previos-search').attr('style','display:block'); 
          $('.clearBtn').attr('style','display:block'); 
          } 
          searchHistoryListEl.innerHTML = "";
          for (var i=0; i<countryList.length; i++){
          var list = countryList[i];
          $('#previos-search').append(`<p><button class="btn" value="${list}">${list}</button></p>`);
          }
          
     }
     // get search history from local sotrage and show on browser
     function init() {
          var storedList = JSON.parse(localStorage.getItem("countryList"));
          if (storedList!==null){
          countryList = storedList;
          }
          renderCountryList();
     }
     //call function for selected city from search history to show weather data
     var buttonClickHandler = function (event) {
          var list = event.target.getAttribute('value');
          if (list) {
          callCountryData(list);
          }
     };
     //get the data for selected city from history list
     searchHistoryListEl.addEventListener('click', buttonClickHandler);

     //clear search history
     $(".clearBtn").on("click",function(){
     localStorage.clear();
     location.reload();
     })
    
    //Calendar
    function displayTime(){
         var reformatDate = dayjs().format('dddd, MMMM D, YYYY, h:mm:ss a');
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
                                   var countryName = data[0].name.common;
                                   storeCountryName(countryName);
                                   renderCountryList();
                                  // currencyExchange();
                                  exchangeRate();
                                  wikipediaBlurb(countryName);// <-----link to wikipedia function
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
    // new exchange link
    function exchangeRate(){
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