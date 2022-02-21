
function main() {

  (function () {
    'use strict';

    $('a.page-scroll').click(function () {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top - 50
          }, 900);
          return false;
        }
      }
    });


    $('body').scrollspy({
      target: '.navbar-default',
      offset: 80
    });

    // Hide nav on click
    $(".navbar-nav li a").click(function (event) {
      // check if window is small enough so dropdown is created
      var toggle = $(".navbar-toggle").is(":visible");
      if (toggle) {
        $(".navbar-collapse").collapse('hide');
      }
    });

    // $('select').selectpicker();

    // Nivo Lightbox 
    $('.portfolio-item a').nivoLightbox({
      effect: 'slideDown',
      keyboardNav: true,
    });

  }());


}
main();
$(document).ready(function () {

  // $(document).ready(function() {

  // $(".owl-carousel").owlCarousel();

  // });

  $("#menu").load("menubar.html")
  $("#footer").load("footer.html")

  $('.panel-collapse').on('show.bs.collapse', function () {
    $(this).siblings('.panel-heading').addClass('active');
  });

  $('.panel-collapse').on('hide.bs.collapse', function () {
    $(this).siblings('.panel-heading').removeClass('active');
  });

  $('.search-field').keyup(function () {
    alert('Handler for .keyup() called.');
  });
});

function genareteUserFriendlyNames(name) {
  if (name == "SNPAndVariantAnalysis") {
    return "SNP And Variant Analysis"
  }
  else if (name == "polyALengthEstimation") {
    return "polyA Length Estimation"
  }
  else if (name == "HiC") {
    return "Hi-C"
  }
  else if (name == "BionanoGenomics") {
    return "Bionano Genomics"
  }
  else if (name == "tenxGenomics") {
    return "10X Genomics"
  }
  else {
    return name.replace(/([a-z])([A-Z])/g, "$1 $2")
  }
}


function checkUndefine(value) {
  if (typeof value == 'undefined' || value == "") {
    return "";
  } else {
    return value
  }
}


function getTitleByValue(title, value) {
  if (typeof value == 'undefined' || value == "") {
    return "";
  } else {
    return title
  }
}

function createSortString(string) {
  if (!isNaN(string)) {
    return string
  }
  return string.toLowerCase().replace(/-/g, "").replace(/[^a-z0-9_\s]/gi, '')}

function removeSpecialChar(string) {
  if (!isNaN(string)) {
    return string
  }
    return string.toLowerCase().replace(/-/g, "").replace(/[^a-z0-9_\s]/gi, '')
}

function changeLinktext(id, from, to) {
  var s = $(id);
  if (s.text().trim() == from.trim()) {
    $(id).html(to)
  } else {
    $(id).html(from)
  }
  return false;
}




function appendWorkflow() {
  let index = removeSpecialChar($("#counter").val());
  $("#counter").val(parseInt(index) + 1);
  wf = '<div id="wf' + index + '"  class=" row block">' +
    '<div class="col-lg-12">' +
    '<h3>Workflow step ' + index + '</h3>' +
    '</div>' +
    '<div class="col-lg-12">' +
    '<div class="form-group">' +
    '<span>Categories:</span>' +
    '<div id="categories-wf' + index + '">' +
    '<div class="row">' +
    '<div class="col-lg-4">' +
    '<div class="checkbox">' +
    '<label for="alignment"> <input type="checkbox" value="Alignment" id="wf' + index + '-alignment" name="categories-wf' + index + '">Alignment</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="AnalysisPipelines">' +
    '<input type="checkbox" value="Analysis Pipelines" id="wf' + index + '-AnalysisPipelines" name="categories-wf' + index + '">Analysis Pipelines</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="BaseCalling">' +
    '<input type="checkbox" value="BaseCalling" id="wf' + index + '-BaseCalling" name="categories-wf' + index + '"> Base Calling</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="BaseModificationDetection">' +
    '<input type="checkbox" value="BaseModificationDetection" id="wf' + index + '-BaseModificationDetection" name="categories-wf' + index + '"> Base Modification Detection</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Demultiplexing">' +
    '<input type="checkbox" value="Demultiplexing"  id="wf' + index + '-Demultiplexing" name="categories-wf' + index + '">  Demultiplexing</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="DenovoAssembly">' +
    '<input type="checkbox" value="DenovoAssembly" id="wf' + index + '-DenovoAssembly" name="categories-wf' + index + '"> <i>De novo</i> Assembly</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="ErrorCorrectionAndPolishing">' +
    '<input type="checkbox" value="ErrorCorrectionAndPolishing" id="wf' + index + '-ErrorCorrectionAndPolishing" name="categories-wf' + index + '"> Error Correction And/Or Polishing</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="EvaluatingExisitingMethods">' +
    '<input type="checkbox" value="EvaluatingExisitingMethods" id="wf' + index + '-EvaluatingExisitingMethods" name="categories-wf' + index + '"> Evaluating Existing Methods</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="GapFilling">' +
    '<input type="checkbox" value="GapFilling" id="wf' + index + '-GapFilling" name="categories-wf' + index + '"> Gap Filling in Assemblies</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="GeneratingConsensusSequence">' +
    '<input type="checkbox" value="GeneratingConsensusSequence" id="wf' + index + '-GeneratingConsensusSequence" name="categories-wf' + index + '"> Generating Consensus Sequence</label>' +
    '</div>' +
    '</div>' +
    '<div class="col-lg-4">' +
    '<div class="checkbox">' +
    '<label for="IsoformDetection">' +
    '<input type="checkbox" value="IsoformDetection" id="wf' + index + '-IsoformDetection" name="categories-wf' + index + '"> Isoform Detection</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="LongReadOverlapping">' +
    '<input type="checkbox" value="LongReadOverlapping" id="wf' + index + '-LongReadOverlapping" name="categories-wf' + index + '"> Long-Read Overlapping</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Metagenomics">' +
    '<input type="checkbox" value="Metagenomics" id="wf' + index + '-Metagenomics" name="categories-wf' + index + '"> Metagenomics</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Normalisation">' +
    '<input type="checkbox" value="Normalisation" id="wf' + index + '-Normalisation" name="categories-wf' + index + '"> Normalisation</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="polyALengthEstimation">' +
    '<input type="checkbox" value="polyALengthEstimation" id="wf' + index + '-polyALengthEstimation" name="categories-wf' + index + '"> polyA Length Estimation</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="ProvideSummaryStatistics">' +
    '<input type="checkbox" value="ProvideSummaryStatistics" id="wf' + index + '-ProvideSummaryStatistics" name="categories-wf' + index + '"> Provide Summary Statistics</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="QualityChecking"><input type="checkbox" value="QualityChecking" id="wf' + index + '-QualityChecking" name="categories-wf' + index + '"> Quality Checking</label>' +
    '</div>' +
    '<div class="checkbox"><label for="QualityFiltering"><input type="checkbox" value="QualityFiltering" id="wf' + index + '-QualityFiltering" name="categories-wf' + index + '"> Quality Filtering</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="QualityTrimming"><input type="checkbox" value="QualityTrimming" id="wf' + index + '-QualityTrimming" name="categories-wf' + index + '"> Quality Trimming</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="ReadQuantification"><input type="checkbox" value="ReadQuantification" id="wf' + index + '-ReadQuantification" name="categories-wf' + index + '"> Read Quantification</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="RNAStructure"><input type="checkbox" value="RNAStructure" id="wf' + index + '-RNAStructure" name="categories-wf' + index + '"> RNA Structure</label>' +
    '</div>' +
    '</div>' +
    '<div class="col-lg-4">' +
    '<div class="checkbox">' +
    '<label for="Scaffolding"><input type="checkbox" value="Scaffolding" id="wf' + index + '-Scaffolding" name="categories-wf' + index + '"> Scaffolding</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Simulators"><input type="checkbox" value="Simulators" id="wf' + index + '-Simulators" name="categories-wf' + index + '"> Simulators</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="SNPAndVariantAnalysis"><input type="checkbox" value="SNPAndVariantAnalysis" id="wf' + index + '-SNPAndVariantAnalysis" name="categories-wf' + index + '"> SNP And/Or Variant Analysis</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="SuitableForSingleCellExperiments"><input type="checkbox" value="SuitableForSingleCellExperiments" id="wf' + index + '-SuitableForSingleCellExperiments" name="categories-wf' + index + '"> Suited For Single-Cell Experiments</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="TaxonomicClassification"><input type="checkbox" value="TaxonomicClassification"  id="wf' + index + '-TaxonomicClassification" name="categories-wf' + index + '"> Taxonomic Classification</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="TestedOnHumanData"><input type="checkbox" value="TestedOnHumanData"  id="wf' + index + '-TestedOnHumanData" name="categories-wf' + index + '"> Tested On Human Data</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="TestedOnNonHumanData"><input type="checkbox" value="TestedOnNonHumanData"  id="wf' + index + '-TestedOnNonHumanData" name="categories-wf' + index + '">  Tested On  Non-Human Data</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Transcriptomics"><input type="checkbox" value="Transcriptomics" id="wf' + index + '-Transcriptomics" name="categories-wf' + index + '">  Transcriptomics</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Visualisation"><input type="checkbox" value="Visualisation" id="wf' + index + '-Visualisation" name="categories-wf' + index + '">  Visualisation</label>' +
    '</div>' +
    '<div class="checkbox">' +
    '<label for="Other"><input type="checkbox" value="Other" id="wf' + index + '-other" name="categories-wf' + index + '">  Other</label>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="col-lg-12">' +
    '<div class="form-group">' +
    '<label for="Technology">Suggested tool/s (if multiple tools, separate by comma) :</label>' +
    '<input type="text" class="form-control" id="wf' + index + '-Suggested-tool" name="Suggested-tool-wf' + index + '" placeholder="">' +
    '</div>' +
    '</div>' +
    '</div>';

  $("#wfblock").append(wf);
}

function restwfForm() {
  $("#wfblock").html("");
  $("#counter").val(1);
  appendWorkflow()
  $("#counter").val(2);

}


function searchFunction(id) {

  console.log($("#" + id).val());
  window.location.href = "search.html?key=" + id;

}

function validateKey(e, value) {
  if (e.keyCode === 13) { // 13 is enter key
    searchFunction(value)
  }
}



// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
    $("#scrollTop").show();
  } else {
    $("#scrollTop").hide();
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
