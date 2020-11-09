#' Check repositories
#'
#' Check if tools are in pkg repositories
#'
#' @param names Vector of tool names
#' @param pkgs List of available packages
#'
#' @return list with repo information

#function to get language from GitHub

#I need to generate a personal token to get sufficient API requests
token <-  '9a5dd566923b6baa2387a17dd07aed98f74c269a'

get_language <- function(repo){
  if (!is.na(repo)){
    languages <- gh(paste0('GET /repos/',repo,'/languages'), .token = token)
      lang_df <- tibble(language = names(languages), codecount = unlist(languages))
      #remove Tex, HTML when it's in the languages. Change Jupyter Notebook to Python. 
      lang_df <- subset(lang_df, !language %in% c('TeX','HTML','Makefile','Roff','Dockerfile'))
      #If Jupyter Notebook, change to Python.
      lang_df[lang_df$language=='Python','codecount'] <- sum(subset(lang_df, language %in% c('Python','Jupyter Notebook'))$codecount)
      lang_df <- subset(lang_df, !language %in% c('Jupyter Notebook'))
      #now calculate percentages
      lang_df$pct <- lang_df$codecount/sum(lang_df$codecount)
      lang_df <- arrange(lang_df, desc(pct)) #order by most important
      #report languages over 10%
      languages_to_report <- paste(subset(lang_df, pct >=0.1)$language,  collapse =', ')
    }
    else languages_to_report <- NA

      return(languages_to_report)
}

#try to get the license automatically from GitHub repo
get_license <- function(repo){
  if (!is.na(repo)){
    license <- gh(paste0('GET /repos/',repo,'/license'), .token = token)[['license']]$name
  }
  else license <- NA
  return(license)
}

check_repos <- function(names, pkgs) {
  
  futile.logger::flog.info("Checking repositories...")
  repos <- jsonlite::fromJSON("docs/data/repositories.json")
  
  added <- 0
  ignored <- 0
  
  # Iterate over tool names
  for (name in names) {
    # Iterate over package lists
    for(repo in names(pkgs)) {
      # Check this repo isn't already set
      if (is.null(repos[[name]][[repo]])) {
        
        lower <- stringr::str_to_lower(name)
        # Check if tool in repository
        if (lower %in% names(pkgs[[repo]])) {
          
          repo_name <- pkgs[[repo]][[lower]]
          repo_path <- paste(repo, repo_name, sep = "/")
          
          # Skip if ignored
          if (repo_path %in% repos[[name]]$Ignored) {
            next
          }
          
          # Create tool entry if missing
          if (!(name %in% names(repos))) {
            repos[[name]] <- list()
          }
          
          # Ask for confirmation repository is correct
          message("Suggested repository for ", name, ": ", repo_path)
          confirmed <- prompt_yn("Confirm")
          if (confirmed) {
            # Set repository
            repos[[name]][[repo]] <- repo_name
            message("Confirmed")
            added <- added + 1
          } else {
            # Ignore repository
            repos[[name]]$Ignored <- c(repos[[name]]$Ignored,
                                       repo_path)
            message("Added to ignore list")
            ignored <- ignored + 1
          }
        }
      }
    }
  }
  
  msg <- paste("Added", added, "new repositories")
  futile.logger::flog.info(msg)
  msg <- paste("Ignored", ignored, "repostories")
  futile.logger::flog.info(msg)
  readr::write_lines(jsonlite::toJSON(repos, pretty = TRUE),
                     "docs/data/repositories.json")
  
  return(repos)
}


#' Add Github
#'
#' Add field indicating Github repositories
#'
#' @param swsheet Tibble containing software table
#'
#' @return swsheet with Github column
add_github <- function(swsheet) {
  
  `%>%` <- magrittr::`%>%`
  
  futile.logger::flog.info("Adding Github...")
  
  swsheet <- swsheet %>%
    dplyr::mutate(Github = ifelse(stringr::str_detect(Code, "github"),
                                  stringr::str_replace(Code,
                                                       "https://github.com/",
                                                       ""),
                                  NA))
  #add languages and license, if from GitHub
  #first try the autoretrieval
  swsheet$Platform_auto <- sapply(swsheet$Github, function(repo){tryCatch(get_language(repo), error = function(e){NA})})
  swsheet$License_auto <- sapply(swsheet$Github, function(repo){tryCatch(get_license(repo), error = function(e){NA})})

  #then compare with what was submitted. If the auto gives values, replace. Grab indices for which there is auto data
  idx_p <- !is.na(swsheet$Platform_auto)
  swsheet$Platform[idx_p] <- swsheet$Platform_auto[idx_p]
  idx_l <- !(swsheet$License_auto %in% c(NA, 'Other'))
  swsheet$License[idx_l] <- swsheet$License_auto[idx_l]
}


#' Add repositories
#'
#' Add fields indicating if tools are available from various software
#' repositories
#'
#' @param swsheet Tibble containing software table
#' @param repos List of repo information
#'
#' @return swsheet with additional repository columns
add_repos <- function(swsheet, repos) {
  
  `%>%` <- magrittr::`%>%`
  
  futile.logger::flog.info("Adding package repositories...")
  
  swsheet %>%
    dplyr::rowwise() %>%
    dplyr::mutate(BioC = ifelse(!is.null(repos[[Name]]$BioC),
                                repos[[Name]]$BioC, NA)) %>%
    dplyr::mutate(CRAN = ifelse(!is.null(repos[[Name]]$CRAN),
                                repos[[Name]]$CRAN, NA)) %>%
    dplyr::mutate(PyPI = ifelse(!is.null(repos[[Name]]$PyPI),
                                repos[[Name]]$PyPI, NA)) %>%
    dplyr::mutate(Conda = ifelse(!is.null(repos[[Name]]$Conda),
                                 repos[[Name]]$Conda, NA)) %>%
    dplyr::ungroup()
}


#' Clean repository url
#'
#' Remove '/' from repository url and replace with '_'
#'
#' @param repo url to repository
#'
#' @return repo_clean A string with '/' replaced with '_'
clean_repo <- function(repo) {
  repo_clean = stringr::str_replace_all(repo, '/', '_')
  return(repo_clean)
}

#' Get shields
#'
#' Download shields describing various repositories
#'
#' @param swsheet Tibble containing software table
get_shields <- function(swsheet) {
  
  futile.logger::flog.info("Getting shields...")
  pb_format <- "   |:bar| :percent Elapsed: :elapsed Remaining: :eta"
  
  pb <- progress::progress_bar$new(total = nrow(swsheet), format = pb_format,
                                   clear = FALSE)
  futile.logger::flog.info("Downloading Bioconductor shields...")
  dir.create("docs/img/shields/BioC/", showWarnings = FALSE)
  for (repo in swsheet$BioC) {
    pb$tick()
    if (!is.na(repo)) {
      years_url <- paste0("http://bioconductor.org/shields/years-in-bioc/",
                          repo, ".svg")
      down_url <- paste0("http://bioconductor.org/shields/downloads/",
                         "release/", repo, ".svg")
      
      repo_clean = clean_repo(repo)
      
      if(file.exists(years_url)){
      download.file(years_url,
                    paste0("docs/img/shields/BioC/", repo_clean, "_years.svg"),
                    quiet = TRUE) }
      if(file.exists(down_url)){
      download.file(down_url,
                    paste0("docs/img/shields/BioC/", repo_clean,
                           "_downloads.svg"),
                    quiet = TRUE) }
    }
  }
  
  pb <- progress::progress_bar$new(total = nrow(swsheet),format = pb_format,
                                   clear = FALSE)
  futile.logger::flog.info("Downloading CRAN shields...")
  dir.create("docs/img/shields/CRAN/", showWarnings = FALSE)
  
  for (repo in swsheet$CRAN) {
    pb$tick()
    if (!is.na(repo)) {
      version_url <- paste0("http://www.r-pkg.org/badges/version/",
                            repo)
      down_url <- paste0("http://cranlogs.r-pkg.org/badges/grand-total/",
                         repo)
      
      repo_clean = clean_repo(repo)
      
      if(file.exists(version_url)){
      download.file(version_url,
                    paste0("docs/img/shields/CRAN/", repo_clean, "_version.svg"),
                    quiet = TRUE) }
      if(file.exists(down_url)){
      download.file(down_url,
                    paste0("docs/img/shields/CRAN/", repo_clean,
                           "_downloads.svg"),
                    quiet = TRUE) }
    }
  }
  
  pb <- progress::progress_bar$new(total = nrow(swsheet), format = pb_format,
                                   clear = FALSE)
  futile.logger::flog.info("Downloading PyPI shields...")
  dir.create("docs/img/shields/PyPI/", showWarnings = FALSE)
  for (repo in swsheet$PyPI) {
    pb$tick()
    if (!is.na(repo)) {
      version_url <- paste0("https://img.shields.io/pypi/v/",
                            repo, ".svg")
      python_url <- paste0("https://img.shields.io/pypi/pyversions/",
                           repo, ".svg")
      status_url <- paste0("https://img.shields.io/pypi/status/",
                           repo, ".svg")
      
      repo_clean <- clean_repo(repo)
      
      if(file.exists(version_url)){
      download.file(version_url,
                    paste0("docs/img/shields/PyPI/", repo_clean,
                           "_version.svg"),
                    quiet = TRUE) }
      if(file.exists(python_url)){
      download.file(python_url,
                    paste0("docs/img/shields/PyPI/", repo_clean,
                           "_python.svg"),
                    quiet = TRUE) }
      if(file.exists(status_url)){
      download.file(status_url,
                    paste0("docs/img/shields/PyPI/", repo_clean,
                           "_status.svg"),
                    quiet = TRUE) }
    }
  }
  
  pb <- progress::progress_bar$new(total = nrow(swsheet), format = pb_format,
                                   clear = FALSE)
  futile.logger::flog.info("Downloading GitHub shields...")
  dir.create("docs/img/shields/GitHub/", showWarnings = FALSE)
  for (repo in swsheet$Github) {
    pb$tick()
    if (!is.na(repo)) {
      stars_url <- paste0("https://img.shields.io/github/stars/",
                          repo, ".svg")
      forks_url <- paste0("https://img.shields.io/github/forks/",
                          repo, ".svg")
      commit_url <- paste0("https://img.shields.io/github/last-commit/",
                           repo, ".svg")
      
      repo_clean <- clean_repo(repo)
      
      if(file.exists(stars_url)){
      download.file(stars_url,
                    paste0("docs/img/shields/GitHub/", repo_clean,
                           "_stars.svg"),
                    quiet = TRUE) }
      if(file.exists(forks_url)){
      download.file(forks_url,
                    paste0("docs/img/shields/GitHub/", repo_clean,
                           "_forks.svg"),
                    quiet = TRUE) }
      if(file.exists(commit_url)){
      download.file(commit_url,
                    paste0("docs/img/shields/GitHub/", repo_clean,
                           "_commit.svg"),
                    quiet = TRUE) }
    }
  }
}