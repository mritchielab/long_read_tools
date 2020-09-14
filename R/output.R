#' Make table JSON
#'
#' Create table JSON
#'
#' @param swsheet Tibble containing software table
make_table_json <- function(swsheet) {

    futile.logger::flog.info("Converting tools table...")

    table <- jsonlite::toJSON(swsheet, pretty = TRUE)

    futile.logger::flog.info("Writing 'tools-table.json'...")
    readr::write_lines(table, "docs/data/tools-table.json")
}


#' Make tools JSON
#'
#' Create tools JSON
#'
#' @param tidysw_cat Tibble containing tidy software table
make_tools_json <- function(tidysw_cat) {

    `%>%` <- magrittr::`%>%`

    futile.logger::flog.info("Converting tools...")

    catlist <- split(tidysw_cat$Category, f = tidysw_cat$Name)

    tools <- tidysw_cat %>%
        dplyr::select(-Category) %>%
        unique() %>%
        dplyr::mutate(Categories = catlist[Name]) %>%
        jsonlite::toJSON(pretty = TRUE)

    futile.logger::flog.info("Writing 'tools.json'...")
    readr::write_lines(tools, "docs/data/tools.json")
}


#' Make categories JSON
#'
#' Create categories JSON
#'
#' @param tidysw_cat Tibble containing tidy software table
#' @param swsheet Tibble containing software table
#' @param descs data.frame containing category descriptions
make_cats_json <- function(tidysw_cat, swsheet, descs) {

    `%>%` <- magrittr::`%>%`

    futile.logger::flog.info("Converting categories...")

    namelist <- split(tidysw_cat$Name, f = tidysw_cat$Category)
    namelist <- lapply(namelist, function(x) {
        swsheet %>%
            dplyr::filter(Name %in% x) %>%
            dplyr::select(Name, Citations, Publications, BioC, CRAN,
                          PyPI, Conda)
    })

    cats <- tidysw_cat %>%
        dplyr::select(Category) %>%
        dplyr::arrange(Category) %>%
        unique() %>%
        dplyr::mutate(Tools = namelist[Category]) %>%
        dplyr::left_join(descs, by = "Category") %>%
        jsonlite::toJSON(pretty = TRUE)

    futile.logger::flog.info("Writing 'categories.json'...")
    readr::write_lines(cats, "docs/data/categories.json")
}


#' Make technologies JSON
#'
#' Create technologies JSON
#'
#' @param tidysw_tech Tibble containing tidy software table
#' @param swsheet Tibble containing software table
#' @param descs data.frame containing category descriptions
make_techs_json <- function(tidysw_tech, swsheet, descs) {
  
  `%>%` <- magrittr::`%>%`
  
  futile.logger::flog.info("Converting technologies...")
  
  namelist <- split(tidysw_tech$Name, f = tidysw_tech$Technology)
  namelist <- lapply(namelist, function(x) {
    swsheet %>%
      dplyr::filter(Name %in% x) %>%
      dplyr::select(Name, Citations, Publications, BioC, CRAN,
                    PyPI, Conda)
  })
  
  techs <- tidysw_tech %>%
    dplyr::select(Technology) %>%
    dplyr::arrange(Technology) %>%
    unique() %>%
    dplyr::mutate(Tools = namelist[Technology]) %>%
    #dplyr::left_join(descs, by = "Technology") %>%
    jsonlite::toJSON(pretty = TRUE)
  
  futile.logger::flog.info("Writing 'technologies.json'...")
  readr::write_lines(techs, "docs/data/technologies.json")
}


#' Make benchmarks JSON
#'
#' Create benchmarks JSON
#'
#' @param benchmark .csv file containing containing benchmark information

make_benchmark_json <- function(){
  futile.logger::flog.info("Creating benchmarks page info...")
  
  bmsheet <- readr::read_csv("benchmark_studies.csv",
                             col_types = readr::cols(
                               Title     = readr::col_character(),
                               Authors   = readr::col_character(),
                               Year      = readr::col_character(),
                               Journal   = readr::col_character(),
                               Issue     = readr::col_character(),
                               Volume    = readr::col_character(),
                               Abstract  = readr::col_character(),
                               doi       = readr::col_character(),
                               Technology = readr::col_character(),
                               Categories = readr::col_character(),
                               ToolsCompared = readr::col_character(),
                               BenchmarkData = readr::col_character(),
                               Recommendations = readr::col_character() 
                               ))
  
  table <- jsonlite::toJSON(bmsheet, pretty = TRUE)
  
  futile.logger::flog.info("Writing 'benchmarks.json'...")
  
  
  readr::write_lines(table, "docs/data/benchmarks.json")
}

#' Write footer
#'
#' Write a HTML footer to use on website pages
write_footer <- function() {
    datetime <- Sys.time()
    attr(datetime, "tzone") <- "UTC"
    asterik <- "Last updated on: "
    writeLines(paste0('<p class="text-muted">',asterik, datetime,' UTC</p>'),"docs/footer_content.html")
}
