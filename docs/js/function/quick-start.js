let technologies = [];
let workflows = [];
let WFData = []
var toolMap = new Object();
$(document).ready(function () {
    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);

    $.getJSON("data/quick-start.json", function (data) {
        console.log(data);
        WFData = data
        quickStart(data, function (callback) {
            console.log({ technologies });
            quickStartTecDropDown(technologies, function (tecHtmlCallback) {
                $('.tecDropdown').html("")
                $('.tecDropdown').append(tecHtmlCallback)
            })
            quickStartWfDropDown(workflows, function (wfHtmlCallback) {
                $('.work-flow-row').html("")
                $('.work-flow-row').append(wfHtmlCallback)
            })
            gearateOptionVals(technologies, function (optionHTML) {
                $("#tec").append(optionHTML);
                $("#tec").selectpicker();

                $("#tec").selectpicker("refresh");
            });
            console.log({ workflows });

        })
    });


    $.getJSON("data/tools.json", function (data) {
        $.each(data, function (index, tool) {
            toolMap[tool.Name.toLowerCase().replace(/-/g, '').replace(/_/g, '')] = tool;

        });
        console.log({ toolMap });
    });



});
function getTool(index) {
    return toolMap[index.toLowerCase().replace(/-/g, '').replace(/_/g, '')];
}

function quickStart(data, callback) {
    $.each(data, function (index, tecArray) {

        let tec = {
            id: index,
            Technology: tecArray.technology
        }
        $.each(tecArray.workflow, function (wfIndex, wfArray) {
            let workflow = {
                id: index + '_' + wfIndex,
                wfName: wfArray.wfName,
                wfDescription: wfArray.description
            }
            workflows.push(workflow)
        });

        technologies.push(tec)
    });
    callback(true)

}
function quickStartTecDropDown(data, callback) {
    let tecDropDownHTML = "";
    $.each(data, function (index, tec) {
        tecDropDownHTML += '<li class="option-li">' +
            '<a href="#" id=' + tec.id + '>' +
            '<div>' +
            '<h4>' + tec.tecName + '</h4>' +
            '<span class="value">' + tec.id + '</span>' +
            '</div>' +
            '</a>' +
            '</li>'
    });

    callback(tecDropDownHTML)

}
function quickStartWfDropDown(data, callback) {
    let wfDropDownHTML = "";
    $.each(data, function (index, wf) {
        // wfDropDownHTML += '<li class="option-li">' +
        //     '<a href="#" id=' + wf.id + '>' +
        //     '<div>' +
        //     '<h4>' + wf.wfName + '</h4>' +
        //     '<p class="wf-description">' + wf.wfDescription + '.</p>' +
        //     '<span class="value ">' + wf.id + '</span>' +
        //     '</div>' +
        //     '</a>' +
        //     '</li>'
        wfDropDownHTML += '<div class="col-lg-12 "><div class="panel panel-default">' +
            '<div class="collapsedhead panel-heading" role="tab" id="heading' + wf.id + '">' +
            '<h4 class="panel-title ' + wf.id + '"><a class="" data-id="' + wf.id + '" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + wf.id + '" aria-expanded="true" aria-controls="collapse' + wf.id + '"> ' + wf.wfName + '</a></h4>' +
            '</div>' +
            '<div id="collapse' + wf.id + '" class="panel-collapse collapse " role="tabpanel"' +
            'aria-labelledby="heading' + wf.id + '" aria-expanded="true" style="">' +
            '<div class="panel-body">' +

            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
    });
    if (wfDropDownHTML == "") {
        wfDropDownHTML = '<div class="col-lg-12 "><div class="panel panel-default">No workflow found</div></div>'
    }
    callback(wfDropDownHTML)

}
function bindWorkflow(value, callback) {
    let HTML = "";
    var ids = value.split("_");
    let workflowData = "";
    if (ids.length == 2) {
        console.log(ids[0]);
        workflowData = WFData[ids[0]].workflow[ids[1]];
    }
    HTML = '  <div class="panel panel-default">' +

        '<div class="panel-header align-center">' +

        '</div>' +
        '<div class="panel-body">' +
        '<div class="col-lg-5">' +
        '<div class="panel panel-default">' +
        '<div class="panel-body">' +
        '<div class="row">' +
        '<div class="col-lg-12">' +

        '<p>' + workflowData.description + '</p>';
    if (workflowData.ref && workflowData.ref.length !== 0) {
        HTML += '<h3>Workflow References</h3>' +
            '<ul>';
    }

    $.each(workflowData.ref, function (index, refList) {
        console.log("SDAS"+workflowData.ref);
        console.log(workflowData.ref);
        HTML += '<li><a target="_blank" href="' + refList.refName + '">' + refList.refName + ' </a></li>'
    })

    if (workflowData.links && workflowData.links.length !== 0) {
        HTML += '<h3>Workflow Source</h3>' +
            '<ul>';
    }

    $.each(workflowData.links, function (index, linksList) {
        console.log("SDAS"+workflowData.links);
        console.log(workflowData.links);
        HTML += '<li><a target="_blank" href="' + linksList.link + '">' + linksList.link + ' </a></li>'
    })

    HTML += '</ul>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="col-lg-7">' +
        '<div class="panel panel-default">' +
        '<div class="panel-body">' +
        '<div class="cat-outer">';

    let catLength = workflowData.categories.length
    let countCat = 0;

    $.each(workflowData.categories, function (index, category) {
        countCat++;

        HTML += '<div class=" category-box">' +
            '<div>';

        var linkedCat = [];
        $.each(category.category, function (index, cat) {
            linkedCat.push(genareteUserFriendlyNames(cat))
        })
        
        HTML += '<p class="cat-name">' + linkedCat.join(", ") + '</p>';
        HTML += '</div>' +
            '<div class="tool-description-block' + index + '" style="display: block;">';
        $.each(category.best_tool, function (index, tool) {
            console.log(getTool(tool));
            if (typeof getTool(tool) !== "undefined") {
                HTML += generateToolSection(getTool(tool), tool)
            }
        })

        HTML += '<p class="tool-description"><a target="_blank"  href="tools.html?sort=Name&cat=' + category.category + '&tec=" >More tools in these categories</a></p>' +
            '</div>' +
            '</div>';
        if (catLength != countCat) {
            HTML += '<div class=" align-center">' +
                '<span class="glyphicon glyphicon-arrow-down"></span>' +
                '</div>';
        }

    })

    HTML += '</div>' +

        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

    callback(HTML)

}

function generateToolSection(obje, key) {
    console.log({ obje });
    var name = obje.Name;
    var description = obje.Description;
    var citations = obje.Citations;
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
    let blockHtml = "";
    blockHtml +=

        '<span class="anc" id="' + name + '" data-id="' + key + '"></span><div class="panel panel-default">' +
        '<div class="collapsedhead panel-heading" role="tab" id="heading' +
        key +
        '">' +
        '<h4 class="panel-title ' + key + '" >' +
        '<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' +
        key +
        '" aria-expanded="false" aria-controls="collapse' +
        key +
        '"> ' +
        name.replace(/-/g, ' ').replace(/_/g, ' ')

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
        '<div class="panel-body left-align">';
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
            code +
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



// --------------------------------------------------------------------------------------------

$("#filterBtn").click(function () {
    var ids = $("#tec").val();
    console.log({ ids });
    let filterdWF = [];
    $.each(workflows, function (index, wf) {
        var wfids = wf.id.split("_");
        if (wfids.length == 2) {
            $.each(ids, function (index, id) {
                if (wfids[0] == id) {

                    filterdWF.push(wf)
                }

            })
        }
    })
    quickStartWfDropDown(filterdWF, function (wfHtmlCallback) {
        $('.work-flow-row').html("")
        $('.work-flow-row').append(wfHtmlCallback)
    })

    var text = "Please select a work flow";
    $(".work-flow .selected a span").html(text);
    $(".work-flow .options ul").hide();
    $(".work-flow-arrow").hide();
    $(".work-flow-description").hide();
});
// ---------------------------------------------------------------------------------


$("#btnReset").click(function () {
    $("#tec").val("");
    $("#tec").selectpicker("refresh");

    quickStartWfDropDown(workflows, function (wfHtmlCallback) {
        $('.work-flow-row').html("")
        $('.work-flow-row').append(wfHtmlCallback)
    })
});

$("body").delegate(".collapsedhead h4 a", "click", function () {
    var id = $(this).attr("data-id")
    bindWorkflow(id, function (HTML) {
        $("#collapse" + id).html("")
        $("#collapse" + id).append(HTML)
    })
});


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

function gearateOptionVals(data, callback) {
    var options = [];
    for (var i = 0; i < data.length; i++) {
        var option = data[i]["Technology"];

        options.push(
            '<option value="' +
            i +
            '">' +
            genareteUserFriendlyNames(option) +
            "</option>"
        );
    }
    callback(options.join(""));
}
