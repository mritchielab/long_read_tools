let masterData; // JSON data will store in this after intial load
let masterCatData; // JSON data will store in this after intial load
let masterTecData; // JSON data will store in this after intial load
let fliterdthings;
// load JSON data when page loading
$(document).ready(function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // alert(window.location.hash)
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
    masterData = data;
    let datalist = masterData;

    let sortby = urlParams.get("sort");
    if (sortby == null || sortby == "null" || sortby == "") {
      (sortby = "Name"), $("#toolsortby").val(sortby);
    } else {
      $("#toolsortby").val(sortby);
    }
    //  sortby!='null' ? $("#toolsortby").val(sortby):($("#toolsortby").val("Name"))
    sortTools(datalist, function (sortdata) {
      if ($("#cat").val() != "" || $("#tec").val() != "") {
        filterTools(sortdata, function (fliterdthings) {
          createbodyMain(fliterdthings, sortby);
        });
      } else {
        createbodyMain(sortdata, sortby);
      }
      createURL();
    });
  });
});

$("#btnReset").click(function () {
  let sortby = $("#toolsortby").val();
  $("#cat").val("");
  $("#tec").val("");
  $("#cat").selectpicker("refresh");
  $("#tec").selectpicker("refresh");

  sortTools(masterData, function (sortdata) {
    if ($("#cat").val() != "" || $("#tec").val() != "") {
      filterTools(sortdata, function (fliterdthings) {
        createbodyMain(fliterdthings, sortby);
      });
    } else {
      createbodyMain(sortdata, sortby);
    }
  });
});
// capture sort by select box changes
$("#toolsortby").change(function () {
  let datalist = masterData;
  let sortby = $("#toolsortby").val();

  sortTools(datalist, function (sortdata) {

    if ($("#cat").val() != "" || $("#tec").val() != "") {
      filterTools(sortdata, function (fliterdthings) {
        createbodyMain(fliterdthings, sortby);
      });
    } else {
      createbodyMain(sortdata, sortby);
    }
  });
});

function sortTools(datalist, callback) {
  let sortby = $("#toolsortby").val();
  if (sortby == "Citations") {
    genCitationArry(datalist, function (citationdata) {
      sortdata = citationdata;
      sortdata.sort(sortByProperty(sortby));
    });
  } else {
    sortdata = datalist.sort(sortByProperty(sortby));
  }

  callback(sortdata);
}

function filterTools(dataP, callback) {
  let data = dataP
  let catData = $("#cat").val();
  let tecData = $("#tec").val();
  if (catData.length) {
    filterdArry = [];



    $.each(data, function (key, objt) {
      var success = catData.every(function (val) {
        return objt.Categories.indexOf(val) !== -1;
      });
      success == true ? filterdArry.push(objt) : (null)

    });
    data = filterdArry
  }

  if (tecData.length) {
    filterdArry = [];
    $.each(data, function (key, objt) {
      var success = tecData.every(function (val) {
        return objt.Technologies.indexOf(val) !== -1;
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
  let sortby = $("#toolsortby").val();

  if (catData != "" || tecData != "") {
    let datalist = masterData;

    sortTools(datalist, function (data) {
      filterTools(data, function (fliterdthings) {
        createbodyMain(fliterdthings, sortby);
      });
    });
  }
});

//create response body
function createbodyMain(data, sortby) {

  $("#accordion").html("");
  $("#accordion").append('<div class="row">');

  if (data.length) {
    if (sortby == "Name") {
      $("#alfalist").show();
      let letterHTML = ' <ul id="name-bookmarks" class="display-inline ui-alfa">';
      let letterArray = genCharArray("A", "Z");
      letterArray.push("1", "2", "3", "4", "5", "6", "7", "8", "9", "0")
      // let i=0
      for (let index = 0; index < letterArray.length; index++) {
        var found_names = $.grep(data, function (v) {
          return (
            v.Name.charAt(0) == letterArray[index] ||
            v.Name.charAt(0) == letterArray[index].toLowerCase()
          );

        });


        if (found_names.length > 0) {
          letterHTML +=
            '<li class="letter-menuA"><a href="#anchor' +
            letterArray[index] +
            '">' +
            letterArray[index] +
            "</a></li>";

          $("#accordion").append(
            '<div class="col-lg-12 "> <span class="anc"  id="anchor' +
            letterArray[index] +
            '"></span><h6 class="anchor">' +
            letterArray[index] +
            "</h6></div>"
          );
          createBody(found_names, "");
        }
      }
      letterHTML += "</ul>";
      $("#alfalist").html("");
      $("#alfalist").append(letterHTML);
    } else {
      $("#alfalist").hide();
      createBody(data, "");
    }
  } else {
    $("#alfalist").hide();
    $("#accordion").append('<div class="col-lg-12"><div class="text-center">No results found - try alternative filtering criteria</div></div>');
  }
  $("#accordion").append("</div>");
}

//create collaps cards in to two coloums
function createBody(data, body) {
  ArryLength = data.length;
  ArryLength % 2 == 0 ?
    (oneSideCount = ArryLength / 2) :
    (oneSideCount = (ArryLength + 1) / 2);
  let count = 1;
  let bodyleft = "";
  let bodyRight = "";
  cval = 1
  $.each(data, function (key, val) {
    if (count++ % 2 != 0) {
      bodyleft += genarateCollapsheading(
        val,
        (val["Name"] + key).replace(/\s/g, "")
      );
    } else {
      bodyRight += genarateCollapsheading(
        val,
        (val["Name"] + key).replace(/\s/g, "")
      );
    }
    cval++
  });
  $("#accordion").append('<div class="col-lg-6">' + bodyleft + "</div>");
  $("#accordion").append('<div class="col-lg-6">' + bodyRight + "</div>");
}

//sort json data
function sortByProperty(property) {
  return function (a, b) {
    if (property == "Name") {

      if (createSortString(a[property]) > createSortString(b[property])) return 1;
      else if (createSortString(a[property]) < createSortString(b[property])) return -1;

    } else if (property == "Technologies") {
      if (a[property].length > b[property].length) return 1;
      else if (a[property].length < b[property].length) return -1;

    } else if (property == "Citations") {
      if (a[property] > b[property]) return -1;
      else if (a[property] < b[property]) return 1;
    }
    return 0;
  };
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

//create collaps cards
function genarateCollapsheading(obje, key) {
  var name = obje.Name;
  var description = obje.Description;
  var citations = obje.Citations;
  var recentcitations = obje.Recent_citations;
  var refs = obje.Refs;
  var platform = obje.Platform;
  var code = obje.Code;
  var license = obje.License;
  var cats = obje.Categories;
  var techs = obje.Technologies;
  var bioc = obje.BioC;
  var pypi = obje.PyPI;
  var cran = obje.CRAN;
  var nPubs = obje.Publications;
  var nPres = obje.Preprints;
  var totalRefs = nPubs + nPres;
  var algo = obje.Underlying_algorithms;
  var assump = obje.Underlying_assumptions;
  var sandw = obje.Strengths_weaknesses;
  var perform = obje.Overall_performance;
  blockHtml = "";
  blockHtml +=

    '<span class="anc" id="' + name.trim().toLowerCase().replace(/\s/g, '') + '" data-id="' + key + '"></span><div class="panel panel-default">' +
    '<div class="collapsedhead panel-heading" role="tab" id="heading' +
    key +
    '">' +
    '<h4 class="panel-title ' + key + '" >' +
    '<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' +
    key +
    '" aria-expanded="false" aria-controls="collapse' +
    key +
    '"> ' +
    name

  if (typeof bioc !== 'undefined') {
    blockHtml += ' <img border="0" height="15" src="img/shields/BioC/' + bioc + '_years.svg">' +
      ' <img border="0" height="15" src="img/shields/BioC/' + bioc + '_downloads.svg">'
  }

  if (typeof cran !== 'undefined') {
    blockHtml += ' <img border="0" height="15" src="img/shields/CRAN/' + cran + '_version.svg">' +
      ' <img border="0" height="15" src="img/shields/CRAN/' + cran + '_downloads.svg">'
  }

  if (typeof pypi !== 'undefined') {
    blockHtml += ' <img border="0" height="15" src="img/shields/PyPI/' + pypi + '_version.svg">' +
      ' <img border="0" height="15" src="img/shields/PyPI/' + pypi + '_python.svg">' +
      ' <img border="0" height="15" src="img/shields/PyPI/' + pypi + '_status.svg">'
  }
  blockHtml += "</a>" +
    "</h4>" +
    "</div>" +
    '<div id="collapse' +
    key +
    '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' +
    key +
    '">' +
    '<div class="panel-body">';
  blockHtml += "<p>" + description + "</p>";

  if (totalRefs > 0) {
    blockHtml +=
      '<div class="panel-group">' +
      '<div class="panel panel-default">' +
      '<div class="panel-heading">' +
      '<h4 class="panel-title">' +
      '<a data-toggle="collapse" href="#collapsePublications' +
      key +
      '">Publications: ' +
      nPubs +
      ", Preprints:" +
      nPres +
      ",Total citations: " +
      citations +
      ", Recent Citations: " +

      recentcitations +
      "</a>" +
      "</h4>" +
      "</div>" +
      '<div id="collapsePublications' +
      key +
      '" class="panel-collapse collapse">' +
      '<div class="panel-body">';
    if (nPubs > 0) {
      blockHtml += '<div class="panel-group">';
      blockHtml +=
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong>Publication(s)</strong></div>' +
        '<div class="panel-body">' +
        "<ul>";
      $.each(refs.Publications, function (key3, publication) {
        blockHtml +=
          '<li> <p>"' +
          publication.Title +
          ' "</p>' +
          ' <p><strong> DOI</strong>: <a target="_blank" href="https://doi.org/' + publication.DOI + '">' +
          publication.DOI +
          '  <a/><strong>, Published</strong>: ' +
          publication.PubDate +
          ', <strong>Citations</strong>:  <a target="_blank" href="https://scholar.google.com/scholar?&q=' + publication.DOI + '">' +
          publication.Citations +
          '</a></p>' +
          '</li>';
      });
      blockHtml += "</ul>" + "</div>" + " </div>" + "</div>";
    }
    if (nPres > 0) {
      blockHtml += '<div class="panel-group">';
      blockHtml +=
        '<div class="panel panel-default">' +
        '<div class="panel-heading"><strong>Preprint(s)</strong></div>' +
        '<div class="panel-body">' +
        "<ul>";
      $.each(refs.Preprints, function (key3, Preprint) {
        blockHtml +=
          '<li> <p>"' +
          Preprint.Title +
          ' "</p>' +
          ' <p><strong>DOI</strong>: <a target="_blank" href="https://doi.org/' + Preprint.DOI + '"> ' +
          Preprint.DOI +
          ', </a> <strong>Published</strong>: ' +
          Preprint.PubDate +
          ', <strong>Citations</strong>:  <a target="_blank" href="https://scholar.google.com/scholar?&q=' + Preprint.DOI + '"> ' +
          Preprint.Citations +
          ' </a></p>' +
          '</li>';
      });
      blockHtml += "</ul>" + "</div>" + " </div>" + "</div>";
    }
    blockHtml += "</div>";
    blockHtml += "</div>";
    blockHtml += "</div>";
    blockHtml += "</div>";
  }
  blockHtml += '<div class="panel-group">';
  typeof platform !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Platform</strong></div>' +
      '<div class="panel-body">' +
      platform +
      "</div>" +
      " </div>") :
    null;
  typeof code !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Code</strong></div>' +
      '<div class="panel-body">' +
      '<a target="_blank" href="' + code + '"> ' + code + ' </a>' +
      "</div>" +
      " </div>") :
    null;
  typeof license !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>License</strong></div>' +
      '<div class="panel-body">' +
      license +
      "</div>" +
      " </div>") :
    null;

  if (cats.length > 0 && cats[0] != null) {
    blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Categories</strong></div>';
    blockHtml += '<div class="panel-body">' + linkCats(cats);
    blockHtml += "</div>";
    blockHtml += " </div>";
  }
  if (techs.length > 0 && techs[0] != null) {
    blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Technologies</strong></div>';
    blockHtml += '<div class="panel-body">' + linkTechs(techs);
    blockHtml += "</div>";
    blockHtml += " </div>";
  }

  typeof algo !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Underlying algorithm</strong></div>' +
      '<div class="panel-body">' +
      algo +
      "</div>" +
      " </div>") :
    null;
  typeof assump !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Underlying assumption</strong></div>' +
      '<div class="panel-body">' +
      assump +
      "</div>" +
      " </div>") :
    null;
  typeof sandw !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Strengths and weaknesses</strong></div>' +
      '<div class="panel-body">' +
      sandw +
      "</div>" +
      " </div>") :
    null;
  typeof perform !== "undefined" ?
    (blockHtml +=
      '<div class="panel panel-default">' +
      '<div class="panel-heading"><strong>Overall performance</strong></div>' +
      '<div class="panel-body">' +
      perform +
      "</div>" +
      " </div>") :
    null;

  blockHtml += "</div>";

  blockHtml += "</div>" + "</div>" + "</div>";

  return blockHtml;
}

function linkCats(cats) {
  var linked = [];

  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];

    if (cat == "SNPAndVariantAnalysis") {
      linked.push(
        '<a href="tools.html?cat=' +
        cat +
        '">' +
        "SNP And Variant Analysis" +
        "</a>"
      );
    } else if (cat == "polyALengthEstimation") {
      linked.push(
        '<a href="tools.html?cat=' +
        cat +
        '">' +
        "polyA Length Estimation" +
        "</a>"
      );
    } else if (cat == "RNAStructure") {
      linked.push(
        '<a href="tools.html?cat=' +
        cat +
        '">' +
        "RNA Structure" +
        "</a>"
      );
    } else {
      linked.push(
        '<a href="tools.html?cat=' +
        cat +
        '">' +
        cat.replace(/([a-z])([A-Z])/g, "$1 $2") +
        "</a>"
      );
    }
  }

  return linked.join(", ");
}

function linkTechs(techs) {
  var linked = [];

  for (var i = 0; i < techs.length; i++) {
    var tech = techs[i];

    if (tech == "PacBio") {
      linked.push('<a href="tools.html?techs=' + tech + '">' + tech + "</a>");
    } else if (tech == "HiC") {
      linked.push(
        '<a href=""tools.html?techs=' + tech + '">' + "Hi-C" + "</a>"
      );
    } else if (tech == "BionanoGenomics") {
      linked.push(
        '<a href="tools.html?techs=' + tech + '">' + "Bionano Genomics" + "</a>"
      );
    } else if (tech == "tenxGenomics") {
      linked.push(
        '<a href="tools.html?techs=' + tech + '">' + "10X Genomics" + "</a>"
      );
    } else {
      linked.push(
        '<a href="tools.html?techs=' +
        tech +
        '">' +
        tech.replace(/([a-z])([A-Z])/g, "$1 $2") +
        "</a>"
      );
    }
  }

  return linked.join(", ");
}

function gearateOptionVals(data, type, callback) {
  var options = [];
  for (var i = 0; i < data.length; i++) {
    if (type == "cat") {
      var option = data[i]["Category"];
      if (option == "SNPAndVariantAnalysis") {
        options.push(
          '<option value="' +
          option +
          '">' +
          "SNP And Variant Analysis" +
          "</option>"
        );
      } else if (option == "polyALengthEstimation") {
        options.push(
          '<option value="' +
          option +
          '">' +
          "polyA Length Estimation" +
          "</option>"
        );
      } else if (option == "RNAStructure") {
        options.push(
          '<option value="' +
          option +
          '">' +
          "RNA Structure" +
          "</option>"
        );
      } else {
        options.push(
          '<option value="' +
          option +
          '">' +
          option.replace(/([a-z])([A-Z])/g, "$1 $2") +
          "</option>"
        );
      }
    }
    if (type == "tec") {
      var option = data[i]["Technology"];
      if (option == "PacBio") {
        options.push('<option value="' + option + '">' + option + '</option>');
      } else if (option == "HiC") {
        options.push('<option value="' + option + '">Hi-C</option>');
      } else if (option == "BionanoGenomics") {
        options.push('<option value="' + option + '">Bionano Genomics</option>');
      } else if (option == "tenxGenomics") {
        options.push('<option value="' + option + '">10X Genomics</option>');
      } else {
        options.push(
          '<option value="' +
          option +
          '">' +
          option.replace(/([a-z])([A-Z])/g, "$1 $2") +
          "</option>"
        );
      }
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