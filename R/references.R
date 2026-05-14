#' Add references
#'
#' Covert references to list column and get citations
#'
#' @param swsheet Tibble containing software table
#' @param titles_cache Tibble containing titles cache
#' @param skip_cites Logical. Whether to skip getting citations from Crossref.
#'
#' @return swsheet with additional columns
#' 

# new function to get recent citations for the previous year; developed by Quentin Gouil
get_recent_cite <- function(doi){
    cites <- citecorp::oc_coci_cites(doi)
    if (is.null(cites) & length(cites) == 0){
        return(as.numeric(0))
    }
    else{
        yearcite <- stringr::str_extract(cites$timespan, 'P.Y') %>% 
        stringr::str_remove_all('[PY]') %>% 
        as.numeric()
        sum(yearcite <=1) %>% as.numeric()
    }
    
}

add_refs <- function(swsheet, titles_cache, skip_cites) {

    `%>%` <- magrittr::`%>%`

    futile.logger::flog.info("Adding references...")

    if (skip_cites=="TRUE") {
        msg <- "Skipping downloading of citations from Crossref!"
        futile.logger::flog.warn(msg)
    }
    else{
    doi_list <- swsheet %>%
        dplyr::mutate(DOIs = stringr::str_split(DOIs, ";")) %>%
        dplyr::pull(DOIs) %>%
        setNames(swsheet$Name)

    if (skip_cites == "FALSE") {
        futile.logger::flog.info("Prefetching citations in parallel...")
        all_dois <- unique(stringr::str_trim(unlist(doi_list)))
        all_dois <- all_dois[!is.na(all_dois)]
        
        cites_dict <- unlist(parallel::mclapply(all_dois, function(doi) {
            res <- tryCatch({
                rcrossref::cr_citation_count(doi)
            }, error = function(e) NA)
            if (is.data.frame(res)) res$count else NA
        }, mc.cores = parallel::detectCores()))
        names(cites_dict) <- all_dois
        
        recent_cites_dict <- unlist(parallel::mclapply(all_dois, function(doi) {
            tryCatch({
                suppressWarnings(get_recent_cite(doi))
            }, error = function(e) NA)
        }, mc.cores = parallel::detectCores()))
        names(recent_cites_dict) <- all_dois
    }

    ref_list <- pbapply::pbsapply(names(doi_list), function(x) {
        dois <- doi_list[[x]]

        if (all(is.na(dois))) {
            return(NA)
        }

        if (skip_cites=="FALSE") {
            trimmed_dois <- stringr::str_trim(dois)
            cites <- as.numeric(cites_dict[trimmed_dois])
            recent_cites <- as.numeric(recent_cites_dict[trimmed_dois])
        } else {
            cites <- rep(NA, length(dois))
            recent_cites <- rep(NA, length(dois))
        }

        dates <- sapply(dois, function(doi) {
          as.character(dplyr::pull(titles_cache[titles_cache$DOI == str_trim(doi), ], "PubDate"))
        })
        
        titles <- get_titles(dois, titles_cache)

        ref <- tibble::tibble(Title     = titles,
                              DOI       = dois,
                              PubDate   = dates,
                              Preprint  = stringr::str_detect(dois, paste(c(paste("10.1101/", stringr::regex("([^'gr\\.'].+$)", ignore_case = TRUE), sep=""),
                                                                            paste("10.7287/", stringr::regex("([^/]+$)", ignore_case = TRUE), sep=""),
                                                                            paste("10.21203/", stringr::regex("([^/]+$)", ignore_case = TRUE), sep=""),
                                                                            paste("10.20944/", stringr::regex("([^/]+$)", ignore_case = TRUE), sep=""),
                                                                            "arxiv"), collapse ="|")),
                              Citations = cites,
                              Recent_citations = recent_cites)
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
                                                function(x) {sum(as.integer(x$Citations))}),
                      Recent_citations = purrr::map_if(ref_list, !is.na(ref_list),
                                                       function(x) {as.integer(x$Recent_citations)}),
                      Publications = purrr::map_if(pub_list, !is.na(pub_list),
                                                   nrow),
                      Preprints = purrr::map_if(pre_list, !is.na(pre_list),
                                                nrow),
                      PubDates = purrr::map_if(ref_list, !is.na(ref_list),
                                               function(x) {paste(x$PubDate, sep = ";")})) %>%
        dplyr::mutate(Citations = purrr::flatten_dbl(Citations),
                      Publications = purrr::flatten_int(Publications),
                      Preprints = purrr::flatten_int(Preprints))
}
	return(swsheet)
}
