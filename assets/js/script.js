$(document).ready(function(){
     const searches = JSON.parse(window.localStorage.getItem("search")) || [];
     var searchHistoryListEl=document.querySelector('#previous-search');

     function historyListUpdate() {

          if (searches.length!==0){
               $('.clearBtn').attr("style","display:block");
          } 
          else if (searches.length===0){
               $('.clearBtn').attr("style","display:none");
          }

          for (let i =0; i<searches.length; i++){
               searches.length > 5? searches.shift() : searches;// if there are more than 5 searches, remove the oldest one

               //when click history list, will show country
               const newPreviousSearch = `<button id="eachPreviousSearch${i}" class="eachPreviousSearch">${searches[i]}</button>`
               $('#previous-search').prepend(newPreviousSearch); 
               $(`#eachPreviousSearch${i}`).on('click', function() {
                    callCountryData(searches[i])
               }) 
          } 
     }
     historyListUpdate();

     var latitude = 45.42;
     var longtitude = -75.7;
     var inputValue;
     var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle Of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome And Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (Us)","Yemen","Zambia","Zimbabwe"];

     initMap();
     // Button function for search
     $('#submit-btn').on('click', function(){
          console.log('yeah!!')             
          const input = $('#input');
          inputValue = formatString(input[0].value);
          $('#input').val("");//clean input space 
          //Counter check the input with countries list
          if((jQuery.inArray(inputValue,countries)>-1)){               
               callCountryData(inputValue);
               if(!searches.includes(inputValue)){
                    storeList();
               }
          } else {
               $("#country-name").text("Please enter valid country name.");
               $(".error").text("Error!"); // You don't want to see this
          }
     })
     // Change input to start with Capital letter
     function formatString(str) {
          return str
            .replace(/(\B)[^ ]*/g, match => (match.toLowerCase()))
            .replace(/(^\w{1})|(\s+\w{1})/g, match => (match.toUpperCase()));
        }

     //Store data in localstorage
     function storeList(){          
               searches.push(inputValue);
               window.localStorage.setItem("search", JSON.stringify(searches));
               searchHistoryListEl.innerHTML = "";
               historyListUpdate()             
     }

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
          if (input=="Canada"){
               compareCurrency = "USD";
               compareName = "United States dollar";
          }

          var country= "https://restcountries.com/v3.1/name/"+input+"?fullText=true"; //API link to get country information
               fetch(country)
                    .then(function(response){
                         if(response.ok){
                              response.json().then(function(data){
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
                                   $("#today-weather").text("Loading....");// <----- can place weather function link here
                                   initMap();
                              })
                         }    
                    })
                    .catch(error => console.log('error', error)); 
     }    

     // CURRENCY EXCHANGE RATE
     function currencyExchange(){          
          var key = "e850a848ce4d55bbbfb07844e6e8f9c7af75429a";

          const url1 =  "https://api.getgeoapi.com/v2/currency/convert?api_key="+key+"&from="+compareCurrency+"&to="+currencyCode+"&amount=1&format=json"
          fetch(url1)
               .then(function(response){
                    if(response.ok){
                         response.json().then(function(data){
                              var resultLocalUsd = (Object.values(data.rates))[0].rate;
                              var showResult = document.createElement("p");
                              showResult.textContent="1 "+currencyName+" = "+resultLocalUsd+" "+compareName;
                              exchangeInfo.appendChild(showResult);
                         })
                    } else {
                         var showResult = document.createElement("p");
                         showResult.textContent=" Sorry, daily limit had used up. ";
                         exchangeInfo.appendChild(showResult);
                    }
                    const url2 =  "https://api.getgeoapi.com/v2/currency/convert?api_key="+key+"&from="+currencyCode+"&to="+compareCurrency+"&amount=1&format=json"

                    $.getJSON(url2, function (data) {
                         var resultLocalUsd = (Object.values(data.rates))[0].rate;
                         var showResult = document.createElement("p");
                         showResult.textContent="1 "+compareName+" = "+resultLocalUsd+" "+currencyName;
                         exchangeInfo.appendChild(showResult);
                    });  
               })       
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
                              // console.log(data);//JSON data to show in console
                              var page = data.query.pages;
                              var pageId = Object.keys(page)[0];
                              var blurb = page[pageId].extract;
                              $('#country-name').text(page[pageId].title);//Format country name to formal
                              // console.log(blurb);
                              var showResult = document.createElement("p");
                              showResult.textContent=blurb;
                              wikiInfo.appendChild(showResult);
                              var wikiLink = document.createElement("a");
                              wikiLink.setAttribute("href", "https://en.wikipedia.org/?curid="+pageId);
                              wikiLink.textContent="Read more on Wikipedia";
                              wikiInfo.appendChild(wikiLink);
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
          zoom: 8
          });
     }
     // END OF MAP


     //clear search history
     $(".clearBtn").on("click",function(){
          localStorage.clear();
          location.reload();
     })
     
     window.onload = callCountryData("Canada"); // <---- default country to load, keep commented unless testing or deploying to avoid API call limit
})