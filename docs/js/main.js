
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
  if (typeof value == 'undefined'  || value=="") {
    return "";
  } else {
    return value
  }
}


function getTitleByValue(title,value) {
  if (typeof value == 'undefined' || value=="") {
    return "";
  } else {
    return title
  }
}

function createSortString(string) {
  return string.toLowerCase().replace(/-/g, "").replace(/_/g, "").replace(/[^a-z0-9\s]/gi, '')
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

