$(document).ready(function () {
  $("#toolcaros").owlCarousel({
    navigation : true,
    pagination : false
});
    $.getJSON("data/categories.json", function (data) {
       let noOfCats= data.length
       $("#catCount").html("")
       noOfCatsRounnd= Math.ceil(noOfCats / 5) * 5; 
       noOfCats<noOfCatsRounnd ? noOfCatsRounnd=noOfCatsRounnd-5:(null)
    
       $("#catCount").append(noOfCatsRounnd+"+")
      });
      

      $.getJSON("data/tools.json", function (data) {
        let noOftools= data.length
        $("#toolsC").html("")
        noOftoolsRounnd= Math.ceil(noOftools / 5) * 5; 
       noOftools<noOftoolsRounnd ? noOftoolsRounnd=noOftoolsRounnd-5:(null)
        $("#toolsC").append(noOftools+"+")

        data.sort(sortByProperty("Name"));
        let toolCar=""
        
      });
});
function sortByProperty(property) {
    return function (a, b) {
      if (property !== "Citations") {
        if (a[property] > b[property]) return 1;
        else if (a[property] < b[property]) return -1;
      } else {
        if (a[property] > b[property]) return -1;
        else if (a[property] < b[property]) return 1;
      }
  
      return 0;
    };
  }