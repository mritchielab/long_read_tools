$(document).ready(function () {
  /* --Variables------------------------------------------------------------- */

  var toolsContainer = $('#tools-list')
  var jsonPath = 'data/tools.json'

  /* --Functions------------------------------------------------------------- */

	function panelInteractions(){

		function prettyGitDate(date_time){

			months = ["January", "February", "March", "April",
					  "May", "June", "July", "August",
					  "September", "October", "November", "December"];

			date = date_time.split("T")[0];
			date_elements = date.split("-");

			year = parseInt(date_elements[0]);
			month = parseInt(date_elements[1]);

			current_year = new Date().getFullYear();

			// Can make this more fancy if required, i.e. "last week, today!"
			if(current_year !== year){
				return(String(months[month-1]) + " " + String(year))
			} else {
				return(String(months[month-1]))
			}

		}

		function githubShields(panel, url){

			// split by forward slash, get username and package name

			url_split = url.split("/");
			username = url_split.slice(-2)[0];
			package_name = url_split.slice(-1)[0];

			json_location = "https://api.github.com/search/repositories?q=repo:" + username + "/" + package_name;

			// Fetch Lassy, then update the required fields

			console.log(json_location)

			$.getJSON(json_location).done(function(json) {
				forks = json.items[0].forks;
				stargazers = json.items[0].stargazers_count;
				last_commit = prettyGitDate(json.items[0].pushed_at);

				// Update panel to reflect requested information
				panel.find(".stars span.blue").text(stargazers)
				panel.find(".forks span.blue").text(forks)
				panel.find(".commits span.green").text(last_commit)

			}).fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
			})

		}

		$(".tool").click(function(){

			package_name = $(this).find("h4").attr("id");

			panel_name = package_name + "_c";
			panel = $("#" + panel_name);
			package_last_commit = panel.find(".commits span.green");

			// Check to see whether this has been populated already... otherwise ping Github
			if(package_last_commit.text() == "Unknown"){
				codebase = panel.find(".codebase_url").text();
				githubShields(panel, codebase)
			}

			letterPositions();
		})

	}

  function checkFixed(from_top){

		current_fixed = toolsContainer.hasClass("fixed_state");

		if(from_top > 200 && current_fixed != true){

			$("#manipulators").addClass("fixed");
			if($("#selectsort").val() == "name"){
				$("#name-bookmarks").addClass("fixed");
			}
			toolsContainer.addClass("fixed_state");

			// Now, find the current letter position

		} else if(from_top < 200 &&  current_fixed != false) {
			$("#manipulators").removeClass("fixed");
			$("#name-bookmarks").removeClass("fixed");
			toolsContainer.removeClass("fixed_state");
		}

	}

	function letterPositions(){

		alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		window.alpha_positions = {}

		$.each(alphabet, function(index, letter){
			if($('#anchor' + letter).length > 0){
				window.alpha_positions[letter] = $('#anchor' + letter).offset().top;
			}
		})

	}

	function trackLetters(from_top){

		if(from_top + 10 < fixed_height){
			$("#name-bookmarks li").removeClass("active");

		} else {

			current_letter = false;

			$.each(window.alpha_positions, function(letter, position){
				if(from_top + 10 > position){
					current_letter = letter;
				}
			})

			$("#name-bookmarks li").removeClass("active");
			$(".letter-menu"+current_letter).addClass("active");

		}
	}

	$(window).scroll(function(){

		from_top = $(window).scrollTop();
		checkFixed(from_top);

		if($("#selectsort").val() == "name"){
			trackLetters(from_top);
		}

	})

  function expandLinked () {
    var url = document.location.toString()
    var hash = url.split('#')[1]

    if (typeof hash !== 'undefined') {
      var title = '#' + hash
      var panel = title + '_c'

      // collapse the expanded panel
      var allPanels = $('#accordion .accordion-collapse')

      allPanels.removeClass('in')
      allPanels.find('.accordion-toggle').addClass('collapsed')

      // expand the requested panel, change the title
      $(panel).addClass('in')
      $(title).find('.accordion-toggle').removeClass('collapsed')

      location.href = title
    }
  }
  
	// Setup tools columns ----------------

		tool_index = 1
		sort_method = $("#selectsort").val();

		if(sort_method == "name"){

			current_letter = false;
			$("#name-bookmarks").show();
			toolsContainer.addClass("name-sort");

		} else {
			$("#name-bookmarks").hide();
			toolsContainer.append('<div class="first-tools col-lg-6 col-md-12 col-sm-12 col-xs-12"></div>');
			toolsContainer.append('<div class="second-tools col-lg-6 col-md-12 col-sm-12 col-xs-12"></div>');
		}
			

  function linkCats (cats) {
    var linked = []

    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i]
	
      if (cat == "SNPAndVariantAnalysis") {
              linked.push('<a href="tools.html?cats=' + cat + '">' +
                    "SNP And Variant Analysis" + '</a>')        
            } else {
              linked.push('<a href="tools.html?cats=' + cat + '">' +
                    cat.replace(/([a-z])([A-Z])/g, '$1 $2') + '</a>')
            }
      }

    return linked.join(', ')
  }
  
  function linkTechs (techs) {
    var linked = []

    for (var i = 0; i < techs.length; i++) {
      var tech = techs[i]
     
       if (tech == "PacBio") {
                linked.push('<a href="tools.html?techs=' + tech + '">' +
                      tech + '</a>')
              } else if (tech == "HiC") {
                linked.push('<a href=""tools.html?techs=' + tech + '">' +
                      "Hi-C" + '</a>')
              } else if (tech == "BionanoGenomics") {
                linked.push('<a href="tools.html?techs=' + tech + '">' +
                      "Bionano Genomics" + '</a>')
              } else if (tech == "tenxGenomics") {
                linked.push('<a href="tools.html?techs=' + tech + '">' +
                      "10X Genomics" + '</a>')        
              } else {
                linked.push('<a href="tools.html?techs=' + tech + '">' +
                      tech.replace(/([a-z])([A-Z])/g, '$1 $2') + '</a>')
              }
     
        }

    return linked.join(', ')
  }

  function printList (urlParams) {
    /* -- Open JSON file, parse the contents, loop through & print markup -- */

    $.ajaxSetup({
      cache: false
    })

    $.getJSON(jsonPath, function (data) {

      /* -- Sort data -- */
      
      if (urlParams.has('sort')) {
            	paramName = urlParams.get('sort');
                switch (urlParams.get('sort')) {
                    case 'cites':
                        data.sort(function(obj1, obj2) {
                            return obj2.Citations - obj1.Citations
                        })
                        break
                    case 'refs':
                        data.sort(function(obj1, obj2) {
                            return (obj2.Publications + obj2.Preprints) - (obj1.Publications + obj1.Preprints)
                        })
                        break
                    case 'pubs':
                        data.sort(function(obj1, obj2) {
                            return obj2.Publications - obj1.Publications
                        })
                        break
                    case 'pres':
                        data.sort(function(obj1, obj2) {
                            return obj2.Preprints - obj1.Preprints
                        })
                        break
                    case 'Name':
                        data.sort(function(obj1, obj2) {
                            return ((obj1['Name'].toUpperCase() > obj2['Name'].toUpperCase()) ? 1 : ((obj1['Name'].toUpperCase() < obj2['Name'].toUpperCase()) ? -1 : 0))
                        })
                        break
                }
            } else {
            	paramName = "Name";
                data.sort(function(obj1, obj2) {
                    return ((obj1['Name'].toUpperCase() > obj2['Name'].toUpperCase()) ? 1 : ((obj1['Name'].toUpperCase() < obj2['Name'].toUpperCase()) ? -1 : 0))
                })
            }

      $.each(data, function (key, value) {
        /* -- Assign returned data -- */
        var name = value.Name
        var doi = value.DOIs
        var doiURL = value.DOIURL
        var pubDate = value.PubDates
        var preprint = value.Preprint
        var citations = value.Citations
        var refs = value.Refs
        var description = value.Description
        var platform = value.Platform
        var code = value.Code
        var github = value.Github
        var added = value.Added
        var updated = value.Updated
        var license = value.License
        var cats = value.Categories
        var techs = value.Technologies
        var bioc = value.BioC
        var pypi = value.PyPI
        var cran = value.CRAN
        var nPubs = value.Publications
        var nPres = value.Preprints
        var totalRefs = nPubs + nPres
        var algo = value.Underlying_algorithms
        var assump = value.Underlying_assumptions
        var sandw = value.Strengths_weaknesses
        var perform =  value.Overall_performance

        var entry = ''
        entry += '<div class="panel-heading">' +
                 '<h4 id="' + name + '" class="panel-title">' +
                 '<a data-toggle="collapse" class="accordion-toggle collapsed" href="#' + name + '_c">' + name

        if (typeof bioc !== 'undefined') {
          entry += ' <img border="0" height="15" src="img/shields/BioC/' + bioc + '_years.svg">' +
                   ' <img border="0" height="15" src="img/shields/BioC/' + bioc + '_downloads.svg">'
        }

        if (typeof cran !== 'undefined') {
          entry += ' <img border="0" height="15" src="img/shields/CRAN/' + cran + '_version.svg">' +
                   ' <img border="0" height="15" src="img/shields/CRAN/' + cran + '_downloads.svg">'
        }

        if (typeof pypi !== 'undefined') {
          entry += ' <img border="0" height="15" src="img/shields/PyPI/' + pypi + '_version.svg">' +
                   ' <img border="0" height="15" src="img/shields/PyPI/' + pypi + '_python.svg">' +
                   ' <img border="0" height="15" src="img/shields/PyPI/' + pypi + '_status.svg">'
        }

        entry += '</a></h4></div>' +
                 '<div id="' + name + '_c" class="panel-collapse collapse">' +
                 '<ul class="list-group">' +
                 '<li class="list-group-item">' + description + '</li>'

        // Loop over references
        if (totalRefs > 0) {

          entry += '<div class="panel-heading">' +
                   '<p id="' + name + '_pubs" class="panel-title">' +
                   '<a data-toggle="collapse" class="accordion-toggle collapsed" href="#' + name + '_pubs_c">' +
                   '<strong>Publications:</strong> ' + nPubs +
                   ', <strong>Preprints:</strong> ' + nPres +
                   ', <strong>Total citations:</strong> ' + citations
          entry += '</a></h4></div>' +
                   '<div id="' + name + '_pubs_c" class="panel-collapse collapse">' +
                   '<ul class="list-group">'

          if (nPubs > 0) {
            var pubs = refs.Publications

            entry += '<li class="list-group-item"><strong>Publications</strong></li>'

            $.each(pubs, function (k, val) {

              var title = val.Title
              var doi = val.DOI
              var date = val.PubDate
              var cites = val.Citations

              entry += '<li class="list-group-item">'
              entry += '<em>"' + title + '"</em><br/>'
              entry += '<strong>DOI: </strong> <a href="https://doi.org/' + doi + '">' + doi + '</a>'
              entry += ', <strong>Published: </strong>' + date
              entry += ', <strong>Citations: </strong> ' + cites
              entry += '</li>'
            })
          }

          if (nPres > 0) {
            var pres = refs.Preprints

            entry += '<li class="list-group-item"><strong>Preprints</strong></li>'

            $.each(pres, function (k, val) {

              var title = val.Title
              var doi = val.DOI
              var cites = val.Citations

              entry += '<li class="list-group-item">'
              entry += '<em>"' + title + '"</em><br/>'
              if (doi.includes('arxiv')) {
                var id = doi.replace("arxiv/", "")
                entry += '<strong>arXiv: </strong> <a href="https://arxiv.org/abs/' + id + '">' + id + '</a>'
              } else {
                entry += '<strong>DOI: </strong> <a href="https://doi.org/' + doi + '">' + doi + '</a>'
              }
              if (typeof cites !== 'undefined') {
                entry += ', <strong>Citations: </strong> ' + cites
              }
              entry += '</li>'
            })
          }
          entry += '</ul></div>'
        }

        entry += '<li class="list-group-item"><strong>Platform: </strong> ' + platform + '</li>'
        if (typeof code !== 'undefined') {
            entry += '<li class="list-group-item"><strong>Code: </strong> <a href="' + code + '">' + code + '</a>'
            if (typeof github !== 'undefined') {
              var github_clean = github.replace("/", "_")

              entry += ' <img border="0" height="15" src="img/shields/GitHub/' + github_clean + '_stars.svg">' +
              ' <img border="0" height="15" src="img/shields/GitHub/' + github_clean + '_forks.svg">' +
              ' <img border="0" height="15" src="img/shields/GitHub/' + github_clean + '_commit.svg">'
            }
            entry += '</li>'
        }
        if (typeof license !== 'undefined') {
          entry += '<li class="list-group-item"><strong>License: </strong> ' + license + '</li>'
        }

        entry += '<li class="list-group-item"><strong>Categories: </strong> ' + linkCats(cats) + '</li>'
                 
        entry += '<li class="list-group-item"><strong>Technologies: </strong> ' + linkTechs(techs) + '</li>'
        
        entry += '<li class="list-group-item"><strong>Underlying algorithm: </strong> ' + algo + '</li>'
        
        entry += '<li class="list-group-item"><strong>Underlying assumption: </strong> ' + assump + '</li>'
        
        entry += '<li class="list-group-item"><strong>Strengths and weaknesses: </strong> ' + sandw + '</li>'
        
        entry += '<li class="list-group-item"><strong>Overall performance: </strong> ' + perform + '</li>' +
                 //'<li class="list-group-item">' +
                 //'<strong>Added: </strong> ' + added +
                 //', <strong>Updated: </strong>' + updated +
                 //'</li>' +
                 '</ul>' +
                 '</div>'

        /* -- Add it to the list! -- */
        //toolsContainer.append(entry)
      //})
      
      
      keep = false;

				selected_categories = $("[name=category_filter]").val();
				selected_technologies = $("[name=tech_filter]").val();

				if($("[name=category_filter]").val().length > 0){
					$.each(selected_categories, function(index, cat){
						if(value.Categories.indexOf(cat) > -1){
							keep = true;
							return false;
						}
					})

					if(!keep){
						return;
					}
				}
				
				// Add it to the list

				if(sort_method == "name"){

					first_letter = name[0].toUpperCase()
					if(first_letter != current_letter){
						toolsContainer.append('<h3 id="anchor' + first_letter + '" class="tools-list">'+first_letter+'</h3>')
						toolsContainer.append('<div id="alpha' + first_letter + '-left" class="first-tools col-lg-6"></div>');
						toolsContainer.append('<div id="alpha' + first_letter + '-right" class="second-tools col-lg-6"></div>');

						current_letter = first_letter;
						tool_index = 1;
					}

					if(tool_index%2 == 0) {
						$('#alpha' + first_letter + '-right').append(entry)
					} else {
						$('#alpha' + first_letter + '-left').append(entry)
					}
				} else {
					if(tool_index%2 == 0) {
						$('.second-tools').append(entry);
					} else {
						$('.first-tools').append(entry)
					}
				}

				tool_index = tool_index + 1

			})

			if(sort_method == "name"){
				// Tool headings

				headings = $(".tools-list");
				//alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
				$.each(headings, function (index, heading) {
					letter = $(heading).html();
					$("#name-bookmarks").append('<li class="letter-menu' + letter + '"><a href="#anchor' + letter + '">' + letter + '</a></li>');
				})

			}

      expandLinked();
      panelInteractions();
			letterPositions();
    })
  }

  /* --Calls----------------------------------------------------------------- */

  var urlParams = new URLSearchParams(window.location.search);

	if (urlParams.has('sort')) {
		$("[name=selectsort]").val(urlParams.get('sort')).change()
	}

	if (urlParams.has('cats')){

		cat_url = urlParams.get('cats').split(",");
		cats = [];

		$.each(cat_url, function(index, cat){
			cats.push(cat);
		})

		$("[name=category_filter]").val(cats);
	}
	
	if (urlParams.has('techs')){

		techs_url = urlParams.get('techs').split(",");
		techs = [];

		$.each(techs_url, function(index, tech){
			techs.push(tech);
		})

		$("[name=tech_filter]").val(techs);
	}

	// Refresh page on change on select or filter button

	function pushURL(){

		select_item = $("[name=selectsort]");

		// Sort Select
		var val = select_item.val()
		var sorter

		if (typeof val !== 'undefined') {
			sorter = val
		}

		// Check for cats
		selected_cats = $("[name=category_filter]").val();
		selected_cats = selected_cats.toString();
		
		// Check for techs
		selected_techs = $("[name=tech_filter]").val();
		selected_techs = selected_techs.toString();		

		// Check for anchors
		var url = document.location.toString();

		var hash
		if (url.includes('#')) {
			hash = url.split('#')[1]
			url = url.split('#')[0]
		}

		url = url.split('?')[0];

		if (hash !== undefined) {
			if(selected_cats.length > 0 && selected_techs.length > 0){
				window.location.href = url + '?sort=' + sorter + "&cats=" + selected_cats + "&techs=" + selected_techs + '#' + hash
				} else if(selected_cats.length > 0) {
				    window.location.href = url + '?sort=' + sorter + "&cats=" + selected_cats + '#' + hash
				} else if(selected_techs.length > 0){
				    window.location.href = url + '?sort=' + sorter + "&techs=" + selected_techs + '#' + hash
				} else {
				window.location.href = url + '?sort=' + sorter + '#' + hash
			}
		} else {
			if(selected_cats.length > 0 && selected_techs.length > 0){
				window.location.href = url + '?sort=' + sorter + "&cats=" + selected_cats + "&techs=" + selected_techs
				} else if(selected_cats.length > 0) {
				    window.location.href = url + '?sort=' + sorter + "&cats=" + selected_cats
				} else if(selected_techs.length > 0){
				    window.location.href = url + '?sort=' + sorter + "&techs=" + selected_techs
				} else {
				window.location.href = url + '?sort=' + sorter
	    	}
		}

		return true;
	}

	$(function(){
		$("[name=selectsort]").change(function(){
			$("[name=category_filter]").val("");
			$("[name=tech_filter]").val("");
			pushURL();
		})
		$("#submit").click(function(){
			pushURL();
		});
		$("#reset").click(function(){
			$("[name=category_filter]").val("");
			$("[name=tech_filter]").val("");
			pushURL();
		});
	})

	// Refresh

	printList(urlParams)

})
