var searchKey = "";
$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    searchKey = urlParams.get("key");
    console.log(searchKey);
    universalSearch(searchKey)
});

function universalSearch(searchKey) {
    var toolMaster = [];
    $.getJSON("data/tools.json", function (data) {
        toolMaster = data;
        console.log(
            toolMaster
        );
        if (toolMaster.length) {
            filteredArray = [];

            $.each(toolMaster, function (key, tool) {
                var success = tool.Name.toLowerCase().includes(searchKey.toLowerCase());
                success == true ? filteredArray.push(tool) : (null)
            });

            $("#search-key-main").val(searchKey);
            $("#search-key-menu").val(searchKey);
            makeSearchBody(filteredArray, function (html) {
                $("#benchmarkRow").html("")
                $("#benchmarkRow").append(html)

            });
        }
    });



}


function makeSearchBody(filteredArray, callback) {
    var html = ""
    if (filteredArray.length > 0) {


        $.each(filteredArray, function (key, tool) {
            html += ' <div class="col-lg-12">' +
                '<div class="panel panel-default">' +
                '<div class=" panel-heading" role="tab" id="">' +
                '<div class="row">' +
                '<div class="col-lg-12">' +
                '<a href="tools.html?sort=Name&cat=&tec=#' +  tool.Name.toLowerCase() + '"> <h4 class=" ABruijn0"><strong>' + tool.Name + '</strong> </h4></a>' +
                '</div>' +
                ' </div>' +
                '</div>' +
                '</div>' +
                '</div>';


        });
    }else{
        html += ' <div class="col-lg-12">' +
        '<div class="">' +
        'Data not found' +
        '</div>';
    }

    callback(html)
}