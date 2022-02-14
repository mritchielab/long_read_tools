#!/usr/bin/env Rscript

"Usage: check_new_submission [options]

This utility script checks the new submission entries to long-read-tools.org for
correct languages and licencing information if they are coming from a GitHub repository
Now the entries are stored in 'new_submission.csv'
First the entry/ies in 'new_submission.csv' is checked against the entries in 'long_read_tools_master.csv' spreadsheet for duplicates
and then acquire the licencing and language information.
If there is a conflict this will record them in 'new_submissions_conflicts.csv',
records with no conflicts will be recorded in 'new_submissions_no_conflicts.csv'
then the database maintainers have to manually check them and merge them with the final 'long-read-tools-master.csv' to set
them into the database generation pipeline via build_lrs_db.R.
" -> doc

#### PACKAGES ####

suppressPackageStartupMessages({
  library(readr)
  library(jsonlite)
  library(docopt)
  library(pbapply)
  library(magrittr)
  library(futile.logger)
  library(aRxiv)
  library(anytime)
  library(citecorp)
  library(stringr)
  library(tidyverse)
  library(gh)
  library(here)
})

#define functions
get_language <- function(repo){
  if (!is.na(repo)){
    languages <- gh(paste0('GET /repos/',repo,'/languages'))
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
    license <- gh(paste0('GET /repos/',repo,'/license'))[['license']]$name
  }
  else license <- NA
  return(license)
}


check_new_submission <- function() {
  # load the swsheet here
  swsheet <- readr::read_csv(here("long_read_tools_master.csv"), # get the correct path to here()
                             col_types = readr::cols(
                               Tool = readr::col_character(),
                               DOI = readr::col_character(),
                               Programming_Language = readr::col_character(),
                               Details = readr::col_character(),
                               Source = readr::col_character(),
                               License = readr::col_character(),
                               Underlying_algorithms = readr::col_character(),
                               Underlying_assumptions = readr::col_character(),
                               Strengths_weaknesses = readr::col_character(),
                               Overall_performance = readr::col_character(),
                               .default = readr::col_logical()
                             )) %>%
    dplyr::rename(Name = Tool,
                  Platform = Programming_Language,
                  DOIs = DOI,
                  Description = Details,
                  Code = Source)
  
  swsheet <- swsheet[order(swsheet$Name),]  
  
  #Load new_sumbissions.csv
  sub <- readr::read_csv(here("new_submissions.csv"), # get the correct path to here()
                         col_types = readr::cols(
                           Tool = readr::col_character(),
                           DOI = readr::col_character(),
                           Programming_Language = readr::col_character(),
                           Details = readr::col_character(),
                           Source = readr::col_character(),
                           License = readr::col_character(),
                           Underlying_algorithms = readr::col_character(),
                           Underlying_assumptions = readr::col_character(),
                           Strengths_weaknesses = readr::col_character(),
                           Overall_performance = readr::col_character(),
                           .default = readr::col_logical()
                         )) %>%
    dplyr::rename(Name = Tool,
                  Platform = Programming_Language,
                  DOIs = DOI,
                  Description = Details,
                  Code = Source)
  
  #Check for duplication
  sub$Duplicated <- sub$Name %in% swsheet$Name | sub$Code %in% swsheet$Code
  
  # Check Language and License annotations
  # Add field indicating Github repositories, languages and license
  # @param sub Tibble containing new submissions
  # @return sub with Github column and autoretrieved languages and license
  
  sub <- sub %>%
    dplyr::mutate(Github = ifelse(stringr::str_detect(Code, "github"),
                                  stringr::str_replace(Code,"https://github.com/",""),
                                  NA))
  #add languages and license, if from GitHub
  sub$Platform_auto <- sapply(sub$Github, function(repo){tryCatch(get_language(repo), error = function(e){NA})})
  sub$License_auto <- sapply(sub$Github, function(repo){tryCatch(get_license(repo), error = function(e){NA})})
  
  #reorder columns to make it easier to read
  sub <- sub %>% relocate(Platform_auto, .after = Platform) %>% relocate(License_auto, .after = License) %>% relocate(Duplicated, .after = Name)
  
  #Summarise 
  ##Initialise the tibbles
  no_conflicts <- NULL
  conflicts <- NULL
  ## compare data
  for (i in 1:dim(sub)[1]){ #for each newly submitted tool
    if (sub[i,'Platform'] == sub[i, 'Platform_auto'] & sub[i,'License'] == sub[i, 'License_auto'] & sub[i,'Duplicated']==FALSE){
      no_conflicts <- bind_rows(no_conflicts, select(sub, colnames(swsheet))[i,])
    }
    else conflicts <- bind_rows(conflicts, sub[i,])
  }
  
  # Write outputs
  if (!is.null(no_conflicts)){write_csv(no_conflicts,here("new_submissions_no_conflicts.csv"))}
  if (!is.null(conflicts)){write_csv(conflicts,here("new_submissions_conflicts.csv"))}
  
  #reinitialise new_submissions.csv
  write.table(t(colnames(swsheet)), sep = ',', file = here("new_submissions.csv"), col.names = FALSE, row.names = FALSE, quote = FALSE)
  
}

