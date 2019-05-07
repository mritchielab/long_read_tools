#' Plot publication status
#'
#' Produces a HTML page with an interactive plot of the publication status of
#' tools in the database
#'
#' @param swsheet Tibble containing software table

# plot published tools on the database by the year

plot_number <- function(swsheet) {
  
  `%>%` <- magrittr::`%>%`

  swsheet$PubDates <- as.Date.character(as.character(swsheet$PubDates))
  swsheet          <- swsheet[!is.na(swsheet$PubDates),]
  
  # all tools over time
  datecount <- swsheet %>%
    dplyr::select(Date = PubDates) %>%
    dplyr::group_by(Date = as.Date(Date)) %>%
    dplyr::summarise(Count = dplyr::n()) %>%
    tidyr::complete(Date = tidyr::full_seq(Date, 1),
                    fill = list(Count = 0)) %>%
    dplyr::mutate(Total = cumsum(Count))
  
  plot <- ggplot2::ggplot(datecount, ggplot2::aes(x = Date, y = Total)) +
    ggplot2::geom_line(size = 2, colour = "#329a89") +
    ggplot2::xlab("Date") +
    ggplot2::ylab("Number of tools") +
    ggplot2::scale_x_date(breaks = scales::pretty_breaks(10)) +
    ggplot2::ggtitle("Number of tools over time") +
    cowplot::theme_cowplot() +
    ggplot2::theme(plot.title   = ggplot2::element_text(size = 20),
                   axis.title.x = ggplot2::element_blank(),
                   axis.text    = ggplot2::element_text(size = 12),
                   axis.text.x  = ggplot2::element_text(angle = 60,
                                                        vjust = 0.5)
    )
  
  plot <- plotly::ggplotly(plot, dynamicTicks = TRUE) %>%
    plotly::layout(margin = list(l = 70, r = 40, b = 90, t = 50))
  
  htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                          file.path(getwd(), "docs/plots/number.html"),
                          selfcontained = FALSE, libdir = "libraries")
  
  
  # tools for different technologies over time
  
  technologies <- colnames(swsheet[7:11])
  
  for (technology in technologies){

    technology2 <- technology
    technology2 <- ifelse(technology2  == "tenxGenomics", "10X Genomics", technology2)
    technology2 <- ifelse(technology2 == "OxfordNanopore", "Oxford Nanopore", technology2)
    technology2 <- ifelse(technology2 == "BionanoGenomics", "Bio-Nano Genomics", technology2)
    technology2 <- ifelse(technology2 == "HiC", "Hi-C", technology2)

    datecount_tech <- swsheet %>%
      dplyr::select(Date = PubDates,
                    technology = technology) %>%
      dplyr::filter(technology == TRUE) %>%
      dplyr::group_by(Date = as.Date(Date)) %>%
      dplyr::summarise(Count = dplyr::n()) %>%
      tidyr::complete(Date = tidyr::full_seq(Date, 1),
                      fill = list(Count = 0)) %>%
      dplyr::mutate(Total = cumsum(Count))

    plot <- ggplot2::ggplot(datecount_tech, ggplot2::aes(x = Date, y = Total)) +
      ggplot2::geom_line(size = 2, colour = "#54b9a1") +
      ggplot2::xlab("Date") +
      ggplot2::ylab("Number of tools") +
      ggplot2::ggtitle(paste(technology2," focused", sep ="")) +
      ggplot2::scale_x_date(breaks = scales::pretty_breaks(10)) +
      cowplot::theme_cowplot() +
      ggplot2::theme(plot.title   = ggplot2::element_text(size = 12),
                     axis.title.x = ggplot2::element_blank(),
                     axis.text    = ggplot2::element_text(size = 12),
                     axis.text.x  = ggplot2::element_text(angle = 60,
                                                          vjust = 0.5)
      )

    plot <- plotly::ggplotly(plot, dynamicTicks = TRUE) %>%
      plotly::layout(margin = list(l = 70, r = 40, b = 90, t = 50))

    htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                            file.path(getwd(), paste("docs/plots/number_", technology,".html", sep="")),
                            selfcontained = FALSE, libdir = "libraries")

  }
}

# plot publication status

plot_publication <- function(swsheet) {
  
  `%>%` <- magrittr::`%>%`
  
  plot <- swsheet %>%
    dplyr::mutate(HasPub = purrr::map(.$Refs,
                                      function(x) {
                                        nrow(x$Publications) > 0
                                      })) %>%
    dplyr::mutate(HasPub = purrr::map(.$HasPub,
                                      function(x) {
                                        ifelse(length(x) == 0, FALSE, x)
                                      }),
                  HasPub = purrr::flatten_lgl(HasPub)) %>%
    dplyr::mutate(HasPre = purrr::map(.$Refs,
                                          function(x) {
                                              nrow(x$Preprints) > 0
                                          })) %>%
        dplyr::mutate(HasPre = purrr::map(.$HasPre,
                                          function(x) {
                                              ifelse(length(x) == 0, FALSE, x)
                                          }),
                      HasPre = purrr::flatten_lgl(HasPre),
                      HasPre = HasPre & !HasPub) %>%
        dplyr::mutate(HasNot = !HasPub & !HasPre) %>%
        dplyr::summarise(NotPublished = sum(HasNot),
                         Published = sum(HasPub),
                         Preprint = sum(HasPre)) %>%
        tidyr::gather(key = Type, value = Count) %>%
        dplyr::mutate(Type = factor(Type,
                                    levels = c("Published", "Preprint",
                                               "NotPublished"),
                                    labels = c("Published", "Preprint",
                                               "Not Published"))) %>%
    dplyr::arrange(Type) %>%
    dplyr::mutate(Cumulative = cumsum(Count),
                  Midpoint = Cumulative - (Count / 2),
                  Midpoint = max(Cumulative) - Midpoint,
                  Percent = round(Count / sum(Count) * 100, 1),
                  Label = paste0(Type, " ", Percent, "%")) %>%
    ggplot2::ggplot(ggplot2::aes(x = 1, fill = Type, weight = Count,
                                 text = paste("Percent:", Percent))) +
    ggplot2::geom_bar(width = 1, position = "stack") +
    ggplot2::geom_text(ggplot2::aes(x = 1, y = Midpoint, label = Label),
                       size = 6, colour = "white") +
    ggplot2::scale_fill_manual(values = c("#00cccc", "#006699",
                                          "#8DC63F")) +
    ggplot2::scale_colour_manual(values = c("#00cccc", "#006699",
                                            "#8DC63F")) +
    ggplot2::ggtitle("Publication status") +
    cowplot::theme_nothing() +
    ggplot2::theme(plot.title = ggplot2::element_text(size = 20,
                                                      face = "bold"),
                   legend.position = "none"
    )
  
  plot <- plotly::ggplotly(plot, tooltip = c("fill", "weight", "text")) %>%
    plotly::layout(margin = list(l = 100, r = 100, b = 20, t = 50))
  
  htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                          file.path(getwd(), "docs/plots/publication.html"),
                          selfcontained = FALSE, libdir = "libraries")
}

#' Plot platforms
#'
#' Produces a HTML page with an interactive plot of the platforms used by tools
#' in the database
#'
#' @param swsheet Tibble containing software table
plot_platforms <- function(swsheet) {
  
  plot <- swsheet %>%
    dplyr::select(Platform) %>%
    dplyr::mutate(IsR = stringr::str_detect(Platform, "R"),
                  IsPython = stringr::str_detect(Platform, "Python"),
                  IsC = stringr::str_detect(Platform, "C"),
                  IsCPP = stringr::str_detect(Platform, "C++"),
                  IsUnknown = is.na(Platform),
                  IsOther = !(IsR | IsPython | IsC | IsCPP |
                                IsUnknown)) %>%
    dplyr::summarise(R = sum(IsR, na.rm = TRUE),
                     Python = sum(IsPython, na.rm = TRUE),
                     C = sum(IsC, na.rm = TRUE),
                     CPP = sum(IsCPP, na.rm = TRUE),
                     Other = sum(IsOther, na.rm = TRUE),
                     Unknown = sum(IsUnknown)) %>%
    tidyr::gather(key = Platform, value = Count) %>%
    dplyr::mutate(Platform = factor(Platform,
                                    levels = c("Python", "R", "C",
                                               "CPP", "Other", "Unknown"),
                                    labels = c("Python", "R", "C",
                                               "C++", "Other", "Unknown")),
                  Percent = round(Count / sum(Count) * 100, 1),
                  Label = paste0(Platform, "\n", Percent, "%")) %>%
    ggplot2::ggplot(ggplot2::aes(x = Platform, weight = Count,
                                 fill = Platform,
                                 text = paste("Percent:", Percent))) +
    ggplot2::geom_bar(width = 0.95, position = "dodge", fill = "#c77951") +
    ggplot2::geom_text(ggplot2::aes(x = Platform,
                                    y = Count + nrow(swsheet) * 0.05,
                                    label = Label, colour = "#c77951"),
                       size = 5) +
    ggplot2::ggtitle("Platforms") +
    cowplot::theme_nothing() +
    ggplot2::theme(plot.title = ggplot2::element_text(size = 20,
                                                      face = "bold"),
                   legend.position = "none"
    )
  
  plot <- plotly::ggplotly(plot, tooltip = c("x", "weight", "text")) %>%
    plotly::layout(margin = list(l = 10, r = 10, b = 20, t = 80))
  
  htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                          file.path(getwd(), "docs/plots/platforms.html"),
                          selfcontained = FALSE, libdir = "libraries")
}

#' Plot technologies
#'
#' Produces a HTML page with an interactive plot showing the percentage of tools
#' in each technology
#'
#' @param swsheet Tibble containing software table
plot_technologies <- function(swsheet) {
  
  `%>%` <- magrittr::`%>%`
  
  techcounts <- swsheet %>%
    dplyr::summarise_at(7:11, sum) %>%
    tidyr::gather(key = Technology, value = Count) %>%
    dplyr::arrange(-Count, Technology) %>%
    dplyr::mutate(Prop = Count / nrow(swsheet)) %>%
    dplyr::mutate(Technology = ifelse(Technology == "tenxGenomics", "10X Genomics", Technology)) %>% 
    dplyr::mutate(Technology = ifelse(Technology == "OxfordNanopore", "Oxford Nanopore", Technology)) %>% 
    dplyr::mutate(Technology = ifelse(Technology == "AllLongReads", "All Long Reads", Technology)) %>% 
    dplyr::mutate(Technology = ifelse(Technology == "BionanoGenomics", "Bio-Nano Genomics", Technology)) %>% 
    dplyr::mutate(Technology = ifelse(Technology == "HiC", "Hi-C", Technology )) %>%
    dplyr::mutate(Technology = factor(Technology, levels = Technology)) %>%
    dplyr::mutate(Percent = round(Prop * 100, 1))
  
  plot <- ggplot2::ggplot(techcounts,
                          ggplot2::aes(x = Technology, weight = Prop,
                                       text = paste("Count:", Count, "\n",
                                                    "Percent:", Percent))) +
    ggplot2::geom_bar(fill = "#519FC7") +
    ggplot2::scale_y_continuous(labels = scales::percent) +
    ggplot2::ylab("Percentage of tools") +
    ggplot2::ggtitle("Technologies") +
    cowplot::theme_cowplot() +
    ggplot2::theme(axis.title.x = ggplot2::element_blank(),
                   legend.position = "none",
                   legend.title    = ggplot2::element_text(size = 14),
                   legend.text     = ggplot2::element_text(size = 12),
                   legend.key.size = ggplot2::unit(25, "points"),
                   plot.title      = ggplot2::element_text(size = 20),
                   axis.text       = ggplot2::element_text(size = 12),
                   axis.text.x     = ggplot2::element_text(angle = 60, hjust = 1,
                                                           vjust = 0.5)
    )
  
  plot <- plotly::ggplotly(plot, tooltip = c("x", "text")) %>%
    plotly::layout(margin = list(l = 80, r = 10, b = 200, t = 50))
  
  htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                          file.path(getwd(), "docs/plots/technologies.html"),
                          selfcontained = FALSE, libdir = "libraries")
}


#' Plot categories
#'
#' Produces a HTML page with an interactive plot showing the percentage of tools
#' in each category
#'
#' @param swsheet Tibble containing software table
plot_categories <- function(swsheet) {
  
  `%>%` <- magrittr::`%>%`
  
  # all categories
  catcounts <- swsheet %>%
    dplyr::summarise_at(12:42, sum) %>%
    tidyr::gather(key = Category, value = Count) %>%
    dplyr::arrange(-Count, Category) %>%
    dplyr::mutate(Prop = Count / nrow(swsheet)) %>%
    dplyr::mutate(Category = ifelse(Category == "SNPAndVariantAnalysis", "SNP And Variant Analysis", gsub("([a-z])([A-Z])", "\\1 \\2", Category)))%>%
    dplyr::mutate(Category = ifelse(Category == "fast5FileProcessing", "fast5 File Processing", gsub("([a-z])([A-Z])", "\\1 \\2", Category)))%>%
    dplyr::mutate(Category = ifelse(Category == "polyALengthEstimation", "polyA Length Estimation", gsub("([a-z])([A-Z])", "\\1 \\2", Category)))%>%
    dplyr::mutate(Category = stringr::str_trim(Category)) %>%
    dplyr::mutate(Category = factor(Category, levels = Category)) %>%
    dplyr::mutate(Percent = round(Prop * 100, 1))
  
  plot <- ggplot2::ggplot(catcounts,
                          ggplot2::aes(x = Category, weight = Prop,
                                       text = paste("Count:", Count, "\n",
                                                    "Percent:", Percent))) +
    ggplot2::geom_bar(fill = "#597325") +
    ggplot2::scale_y_continuous(labels = scales::percent) +
    ggplot2::ylab("Percentage of tools") +
    ggplot2::ggtitle("Categories") +
    cowplot::theme_cowplot() +
    ggplot2::theme(axis.title.x = ggplot2::element_blank(),
                   legend.position = "none",
                   legend.title    = ggplot2::element_text(size = 14),
                   legend.text     = ggplot2::element_text(size = 12),
                   legend.key.size = ggplot2::unit(25, "points"),
                   plot.title      = ggplot2::element_text(size = 20),
                   axis.text       = ggplot2::element_text(size = 12),
                   axis.text.x     = ggplot2::element_text(angle = 60, hjust = 1,
                                                           vjust = 0.5)
    )
  
  plot <- plotly::ggplotly(plot, tooltip = c("x", "text")) %>%
    plotly::layout(margin = list(l = 80, r = 10, b = 200, t = 50))
  
  htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                          file.path(getwd(), "docs/plots/categories.html"),
                          selfcontained = FALSE, libdir = "libraries")
  
  # categories in each technology
  
  technologies <- colnames(swsheet[7:11])
  
  for (technology in technologies){
    
    technology2 <- technology
    technology2 <- ifelse(technology2  == "tenxGenomics", "10X Genomics", technology2)
    technology2 <- ifelse(technology2 == "OxfordNanopore", "Oxford Nanopore", technology2)
    technology2 <- ifelse(technology2 == "BionanoGenomics", "Bio-Nano Genomics", technology2)
    technology2 <- ifelse(technology2 == "HiC", "Hi-C", technology2)
    
    swsheet2 <- swsheet[swsheet[technology] == TRUE,]
    catcounts_tech <- swsheet2 %>% 
      dplyr::summarise_at(12:42, sum) %>%
      tidyr::gather(key = Category, value = Count) %>%
      dplyr::arrange(-Count, Category) %>%
      dplyr::mutate(Prop = Count / nrow(swsheet)) %>%
      dplyr::mutate(Category = ifelse(Category == "SNPAndVariantAnalysis", "SNP And Variant Analysis", gsub("([a-z])([A-Z])", "\\1 \\2", Category)))%>%
      dplyr::mutate(Category = stringr::str_trim(Category)) %>%
      dplyr::mutate(Category = factor(Category, levels = Category)) %>%
      dplyr::mutate(Percent = round(Prop * 100, 1))
    
    plot <- ggplot2::ggplot(catcounts_tech,
                            ggplot2::aes(x = Category, weight = Prop,
                                         text = paste("Count:", Count, "\n",
                                                      "Percent:", Percent))) +
      ggplot2::geom_bar(fill = "#9FC751") +
      ggplot2::scale_y_continuous(labels = scales::percent) +
      ggplot2::ylab("Percentage of tools") +
      ggplot2::ggtitle(paste(technology2," focused", sep ="")) +
      cowplot::theme_cowplot() +
      ggplot2::theme(axis.title.x = ggplot2::element_blank(),
                     legend.position = "none",
                     legend.title    = ggplot2::element_text(size = 12),
                     legend.text     = ggplot2::element_text(size = 10),
                     legend.key.size = ggplot2::unit(25, "points"),
                     plot.title      = ggplot2::element_text(size = 12),
                     axis.text       = ggplot2::element_text(size = 9),
                     axis.text.x     = ggplot2::element_text(angle = 60, hjust = 1,
                                                             vjust = 0.5)
      )
    
    plot <- plotly::ggplotly(plot, dynamicTicks = TRUE) %>%
      plotly::layout(margin = list(l = 70, r = 40, b = 90, t = 50))
    
    htmlwidgets::saveWidget(widgetframe::frameableWidget(plot),
                            file.path(getwd(), paste("docs/plots/categories_", technology,".html", sep="")),
                            selfcontained = FALSE, libdir = "libraries")
    
  }
}