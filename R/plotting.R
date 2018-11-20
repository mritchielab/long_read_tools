#' Plot publication status
#'
#' Produces a HTML page with an interactive plot of the publication status of
#' tools in the database
#'
#' @param swsheet Tibble containing software table
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
        dplyr::mutate(HasNot = !HasPub) %>%
        dplyr::summarise(NotPublished = sum(HasNot),
                         Published = sum(HasPub)
                         ) %>%
        tidyr::gather(key = Type, value = Count) %>%
        dplyr::mutate(Type = factor(Type,
                                    levels = c("Published",
                                               "NotPublished"),
                                    labels = c("Published",
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
        ggplot2::scale_fill_manual(values = c("#EC008C", "#00ADEF",
                                              "#8DC63F")) +
        ggplot2::scale_colour_manual(values = c("#EC008C", "#00ADEF",
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
                      IsMATLAB = stringr::str_detect(Platform, "MATLAB"),
                      IsCPP = stringr::str_detect(Platform, "C++"),
                      IsUnknown = is.na(Platform),
                      IsOther = !(IsR | IsPython | IsMATLAB | IsCPP |
                                    IsUnknown)) %>%
        dplyr::summarise(R = sum(IsR, na.rm = TRUE),
                         Python = sum(IsPython, na.rm = TRUE),
                         MATLAB = sum(IsMATLAB, na.rm = TRUE),
                         CPP = sum(IsCPP, na.rm = TRUE),
                         Other = sum(IsOther, na.rm = TRUE),
                         Unknown = sum(IsUnknown)) %>%
        tidyr::gather(key = Platform, value = Count) %>%
        dplyr::mutate(Platform = factor(Platform,
                                        levels = c("R", "Python", "MATLAB",
                                                   "CPP", "Other", "Unknown"),
                                        labels = c("R", "Python", "MATLAB",
                                                   "C++", "Other", "Unknown")),
                      Percent = round(Count / sum(Count) * 100, 1),
                      Label = paste0(Platform, "\n", Percent, "%")) %>%
        ggplot2::ggplot(ggplot2::aes(x = Platform, weight = Count,
                                     fill = Platform,
                                     text = paste("Percent:", Percent))) +
        ggplot2::geom_bar(width = 0.95, position = "dodge") +
        ggplot2::geom_text(ggplot2::aes(x = Platform,
                                        y = Count + nrow(swsheet) * 0.05,
                                        label = Label, colour = Platform),
                           size = 5) +
        ggplot2::scale_fill_manual(values = c("#EC008C", "#00ADEF", "#8DC63F",
                                              "#00B7C6", "#F47920", "#7A52C7",
                                              "#999999")) +
        ggplot2::scale_colour_manual(values = c("#EC008C", "#00ADEF", "#8DC63F",
                                                "#00B7C6", "#F47920", "#7A52C7",
                                                "#999999")) +
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



#' Plot categories
#'
#' Produces a HTML page with an interactive plot showing the percentage of tools
#' in each category
#'
#' @param swsheet Tibble containing software table
plot_categories <- function(swsheet) {

    `%>%` <- magrittr::`%>%`

    catcounts <- swsheet %>%
        dplyr::summarise_at(8:28, sum) %>%
        tidyr::gather(key = Category, value = Count) %>%
        dplyr::arrange(-Count, Category) %>%
        dplyr::mutate(Prop = Count / nrow(swsheet)) %>%
        dplyr::mutate(Category = stringr::str_replace_all(Category,
                                                          "([[:upper:]])",
                                                          " \\1")) %>%
        dplyr::mutate(Category = stringr::str_trim(Category)) %>%
        dplyr::mutate(Category = factor(Category, levels = Category)) %>%
        dplyr::mutate(Percent = round(Prop * 100, 1))

    plot <- ggplot2::ggplot(catcounts,
                            ggplot2::aes(x = Category, weight = Prop,
                                         text = paste("Count:", Count, "\n",
                                                      "Percent:", Percent))) +
        ggplot2::geom_bar(fill = "#7A52C7") +
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
}
