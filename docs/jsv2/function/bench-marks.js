let masterData; // JSON data will store in this after intial load
let masterCatData; // JSON data will store in this after intial load
let masterTecData; // JSON data will store in this after intial load
let fliterdthings;
// load JSON data when page loading
$(document).ready(function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  $.getJSON("data/categories.json", function (data) {
    masterCatData = data;
    gearateOptionVals(masterCatData, "cat", function (optionHTML) {
      $("#cat").append(optionHTML);
      $("#cat").selectpicker();
      cat = urlParams.get("cat");
      cat && $("#cat").val(cat.split(","));
      $("#cat").selectpicker("refresh");
    });
  });

  $.getJSON("data/technologies.json", function (data) {
    masterTecData = data;
    gearateOptionVals(masterTecData, "tec", function (optionHTML) {
      $("#tec").append(optionHTML);
      $("#tec").selectpicker();
      tec = urlParams.get("tec");
      tec && $("#tec").val(tec.split(","));
      $("#tec").selectpicker("refresh");
    });
  });

  $.getJSON("data/tools.json", function (data) {
    masterToolData = data;
    let datalist = masterToolData;

    masterToolData = masterToolData.sort(sortByPropertyASE("Name"));

    gearateOptionVals(masterToolData, "tool", function (optionHTML) {
      $("#toolsortby").append(optionHTML);
      $("#toolsortby").selectpicker();

    });
  });


  $.getJSON("data/benchmarks.json", function (data) {
    masterData = data;
    masterData = masterData.sort(sortByPropertyASE("Title"));
    let datalist = masterData;

    let sortby = urlParams.get("sort");
    if (sortby == null || sortby == "null" || sortby == "") {
      (sortby = "Name"), $("#toolsortby").val(sortby);
    } else {
      $("#toolsortby").val(sortby);
    }
    //  sortby!='null' ? $("#toolsortby").val(sortby):($("#toolsortby").val("Name"))


    if ($("#cat").val() != "" || $("#tec").val() != "") {
      filterTools(datalist, function (fliterdthings) {
        createbodyMain(fliterdthings, sortby);
      });
    } else {
      createbodyMain(datalist, sortby);
    }
    createURL();

  });
});



//sort json data
function sortByPropertyASE(property) {
  return function (a, b) {

    if (createSortString(a[property]) < createSortString(b[property])) return -1;
    else if (createSortString(a[property]) > createSortString(b[property])) return 1;

    return 0;
  };
}

//sort json data
function sortByProperty(property) {
  return function (a, b) {

    if (createSortString(a[property]) > createSortString(b[property])) return -1;
    else if (createSortString(a[property]) < createSortString(b[property])) return 1;

    return 0;
  };
}

$("#btnReset").click(function () {
  // let sortby = $("#toolsortby").val();
  $("#cat").val("");
  $("#tec").val("");
  $("#toolsortby").val("");
  $("#cat").selectpicker("refresh");
  $("#tec").selectpicker("refresh");
  $("#toolsortby").selectpicker("refresh");


  if ($("#cat").val() != "" || $("#tec").val() != "") {
    filterTools(masterData, function (fliterdthings) {
      createbodyMain(fliterdthings, "");
    });
  } else {
    createbodyMain(masterData, "");
  }

});


function sortTools(datalist, callback) {

  sortdata = datalist.sort(sortByProperty("Title"));


  callback(sortdata);
}

function filterTools(dataP, callback) {
  let data = dataP
  let catData = $("#cat").val();
  let tecData = $("#tec").val();
  let toolData = $("#toolsortby").val();

  if (catData.length) {
    filterdArry = [];
    $.each(data, function (key, objt) {
      var success = catData.every(function (val) {
        var catArray = objt.Categories.replace(/\s/g, '').toLowerCase().split(",")
        return catArray.indexOf(genareteUserFriendlyNames(val.replace(/\s/g, '').toLowerCase())) !== -1;
      });
      success == true ? filterdArry.push(objt) : (null)

    });
    data = filterdArry
  }

  if (tecData.length) {
    filterdArry = [];
    $.each(data, function (key, objt) {
      var success = tecData.every(function (val) {
        var tecArray = objt.Technology.replace(/\s/g, '').toLowerCase().split(",")

        return tecArray.indexOf(genareteUserFriendlyNames(val.replace(/\s/g, '').toLowerCase())) !== -1;
      });
      success == true ? filterdArry.push(objt) : (null)
    });
    data = filterdArry
  }

  if (toolData.length) {

    filterdArry = [];
    $.each(data, function (key, objt) {
      var success = toolData.every(function (val) {
        var tecArray = objt.ToolsCompared.replace(/\s/g, '').toLowerCase().split(",")
        return tecArray.indexOf(val.replace(/\s/g, '').toLowerCase()) !== -1;
      });
      success == true ? filterdArry.push(objt) : (null)
    });
    data = filterdArry
  }

  callback(data);
}

$("#filterBtn").click(function () {
  let catData = $("#cat").val();
  let tecData = $("#tec").val();
  let toolData = $("#toolsortby").val();

  if (catData != "" || tecData != "" || toolData != "") {
    let datalist = masterData;

    filterTools(masterData, function (fliterdthings) {
      createbodyMain(fliterdthings, "sortby");
    });

  }
});

//create response body
function createbodyMain(data, sortby) {

  $("#benchmarkRow").html("");
  // $("#accordion").append('<div class="row">');

  if (data.length) {

    $.each(data, function (key, val) {
      $("#benchmarkRow").append(
        '<div class="col-lg-12 col-md-12">' +
        '<div class="panel panel-default">' +
        '<div class="collapsedhead panel-heading" role="tab" id="heading' + key + '">' +
        '<div class="row">' +
        '<div class="col-lg-8 col-md-8">' +
        '<h4 class=" ' + key + '"><strong>' + val.Title + '</strong> </h4>' +
        '<p>' + getTitleByValue("DOI : ", val.doi) + '<a href="' + val.doi + '">' + val.doi + '</a> </p>' +
        '</div>' +
        '<div class="col-lg-4 col-md-4">' +
        '<div class="row">' +
        '<div class="col-lg-12 col-md-12">' + getTitleByValue('Year: ', val.Year) + ' ' + checkUndefine(val.Year) + '</div > ' +
        '</div>' +
        '</div>' +
        ' </div>' +
        '<div class="row">' +
        '<div class="col-lg-12 col-md-12">' +
        '<p>' + getTitleByValue("Authors : ", val.Authors) + ' ' + val.Authors + '</p>' +
        '</div>' +
        '</div>' +
        '<a class="collapsed" role="button" data-toggle="collapse"   data-parent="#accordion" href="#collapse' + key + '" aria-expanded="false" aria-controls="collapse' + key + '" onclick="changeLinktext(this, \'View More\', \'View less\')">View More</a>' +

        '</div>' +
        '<div id="collapse' + key + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + key + '" aria-expanded="false" style="height: 0px;">' +
        '<div class="panel-body">' +

        '<div class="panel-group">' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong> Benchmark data</strong>' +
        '</div>' +
        '<div class="panel-body">  <div class="BenchmarkData' + key + ' fix-height">' + val.BenchmarkData + '</div> <a id="BenchmarkData' + key + '" class="view-more"  onclick="abstractviewmore(this, \'View More\', \'View less\');">View More</a> </div>' +
        '</div>' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading">' +
        '<strong>Recommendations</strong>' +
        '</div>' +
        '<div class="panel-body"> ' + val.Recommendations + ' </div>' +
        '</div>' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong>Abstract</strong>' +
        '</div>' +
        '<div class="panel-body">  <div class="Abstract' + key + ' fix-height">' + val.Abstract + '</div> <a id="Abstract' + key + '" class="view-more"  onclick="abstractviewmore(this, \'View More\', \'View less\');">View More</a> </div>' +
        '</div>' +
        '</div>' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong>Technology</strong>' +
        '</div>' +
        '<div class="panel-body"> ' + linkTechs(val.Technology.split(",")) + '</div>' +
        '</div>' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong>Categories </strong>' +
        '</div>' +
        '<div class="panel-body"> ' + linkCats(val.Categories.split(",")) + ' </div>' +
        '</div>' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong>Tools </strong>' +
        '</div>' +
        '<div class="panel-body"> ' + linkTools(val.ToolsCompared.split(",")) + ' </div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>')
    })
  } else {
    $("#alfalist").hide();
    $("#benchmarkRow").append('<div class="col-lg-12 col-md-12"><div class="text-center">No results found - try alternative filtering criteria</div></div>');
  }
  // $("#accordion").append("</div>");
}



function createURL() {
  let catData = $("#cat").val();
  let tecData = $("#tec").val();
  stringCat = catData.join(",");
  stringtec = tecData.join(",");
  let sortby = $("#toolsortby").val();
  var hash = location.hash;
  let refresh =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?sort=" +
    sortby +
    "&cat=" +
    stringCat +
    "&tec=" +
    stringtec + "" + hash;
  window.history.pushState({
    path: refresh
  }, "", refresh);
  //   alert( $(hash).data('id'))
  if (hash) {
    window.location.href = refresh;

    $('#collapse' + $(hash).data('id')).collapse({
      toggle: true
    });
  }
  //   $('#'+hash+' > a')[0].click();
}


function linkCats(cats) {
  var linked = [];

  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];
    linked.push(
      '<a href="tools.html?cat=' +
      cat +
      '">' +
      genareteUserFriendlyNames(cat) +
      "</a>"
    );
  }

  return linked.join(", ");
}

function linkTools(tool) {
  var linked = [];

  for (var i = 0; i < tool.length; i++) {
    var cat = tool[i];
    linked.push(
      '<a target="_blank" href="tools.html#'+cat.trim().toLowerCase().replace(/\s/g, '')+'">' +
      genareteUserFriendlyNames(cat) +
      "</a>"
    );
  }

  return linked.join(", ");
}

function linkTechs(techs) {
  var linked = [];

  for (var i = 0; i < techs.length; i++) {
    var tech = techs[i];
    linked.push(
      '<a href="tools.html?techs=' +
      tech +
      '">' +
      genareteUserFriendlyNames(tech) +
      "</a>"
    );
  }

  return linked.join(", ");
}

function gearateOptionVals(data, type, callback) {
  var options = [];
  for (var i = 0; i < data.length; i++) {
    if (type == "cat") {
      var option = data[i]["Category"];
      options.push(
        '<option value="' +
        option +
        '">' +
        genareteUserFriendlyNames(option) +
        "</option>"
      );

    }
    if (type == "tec") {
      var option = data[i]["Technology"];

      options.push(
        '<option value="' +
        option +
        '">' +
        genareteUserFriendlyNames(option) +
        "</option>"
      );

    }
    if (type == "tool") {
      var option = data[i]["Name"];

      options.push(
        '<option value="' +
        option +
        '">' +
        option +
        "</option>"
      );

    }
  }
  callback(options.join(""));
}

// create cha list
function genCharArray(charA, charZ) {
  var a = [],
    i = charA.charCodeAt(0),
    j = charZ.charCodeAt(0);
  for (; i <= j; ++i) {
    a.push(String.fromCharCode(i));
  }
  return a;
}

function genCitationArry(data, callback) {
  let withCitation = [];
  let withOutCitation = [];
  $.each(data, function (key, objt) {
    if (typeof objt.Citations !== "undefined") {
      withCitation.push(objt);
    } else {
      withOutCitation.push(objt);
    }
  });
  callback(withCitation.concat(withOutCitation));
}

function abstractviewmore(id, from, to) {
  var s = $(id);
  if (s.text().trim() == from.trim()) {
    $(id).html(to)
    $("." + id.id).addClass("height-auto");

  } else {
    $(id).html(from)
    $("." + id.id).removeClass("height-auto");

  }
  return false;
}