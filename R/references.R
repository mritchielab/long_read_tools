#' Add references
#'
#' Covert references to list column and get citations
#'
#' @param swsheet Tibble containing software table
#' @param titles_cache Tibble containing titles cache
#' @param skip_cites Logical. Whether to skip getting citations from Crossref.
#'
#' @return swsheet with additional columns
add_refs <- function(swsheet, titles_cache, skip_cites) {

    `%>%` <- magrittr::`%>%`

    futile.logger::flog.info("Adding references...")

    if (skip_cites=="TRUE") {
        msg <- "Skipping downloading of citations from Crossref!"
        futile.logger::flog.warn(msg)
    }

    doi_list <- swsheet %>%
        dplyr::mutate(DOIs = stringr::str_split(DOIs, ";")) %>%
        dplyr::pull(DOIs) %>%
        setNames(swsheet$Name)

    ref_list <- pbapply::pbsapply(names(doi_list), function(x) {
        dois <- doi_list[[x]]

        if (all(is.na(dois))) {
            return(NA)
        }

        if (skip_cites=="FALSE") {
            cites <- sapply(dois, function(doi) {
                cite <- tryCatch({
                    rcrossref::cr_citation_count(doi)
                }, error = function(e) {
                    NA
                })

                Sys.sleep(sample(seq(0, 1, 0.1), 1))

                return(cite)
            })
        } else {
            cites <- rep(NA, length(dois))
        }

        dates <- sapply(dois, function(doi) {
          as.character(dplyr::pull(titles_cache[titles_cache$DOI == doi, ], "PubDate"))
        })
        
        titles <- get_titles(dois, titles_cache)

        ref <- tibble::tibble(Title     = titles,
                              DOI       = dois,
                              PubDate   = dates,
                              Preprint  = stringr::str_detect(dois, paste(c(paste("10.1101/", stringr::regex("[0-9]{1,6}$", ignore_case = TRUE), sep=""),"arxiv"), collapse ="|")),
                              Citations = cites[[2]])
    })

    pre_list <- purrr::map_if(ref_list, !is.na(ref_list),
                              dplyr::filter, Preprint == TRUE)
    pub_list <- purrr::map_if(ref_list, !is.na(ref_list),
                              dplyr::filter, Preprint == FALSE)

    swsheet <- swsheet %>%
        dplyr::mutate(Refs = purrr::map2(pub_list, pre_list,
                                         function(x, y) {
                                             list(Publications = x,
                                                  Preprints = y)
                                             })) %>%
        dplyr::mutate(Citations = purrr::map_if(ref_list, !is.na(ref_list),
                                                function(x) {sum(x$Citations)}),
                      Publications = purrr::map_if(pub_list, !is.na(pub_list),
                                                   nrow),
                      Preprints = purrr::map_if(pre_list, !is.na(pre_list),
                                                nrow),
                      PubDates = purrr::map_if(ref_list, !is.na(ref_list),
                                               function(x) {paste(x$PubDate, sep = ";")})) %>%
        dplyr::mutate(Citations = purrr::flatten_dbl(Citations),
                      Publications = purrr::flatten_int(Publications),
                      Preprints = purrr::flatten_int(Preprints))
	return(swsheet)
}
