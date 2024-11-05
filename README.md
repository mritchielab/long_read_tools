![long-read-tools.org](docs/img/Logo.png)

# long-read-tools.org

[![Project Status](http://www.repostatus.org/badges/latest/active.svg)](http://www.repostatus.org/#active)
[![Lifecycle](https://img.shields.io/badge/lifecycle-stable-brightgreen.svg)](https://www.tidyverse.org/lifecycle/#stable)

A database of software tools for the analysis of long read sequencing data. To
make it into the database software must be available for download and public use
somewhere (CRAN, Bioconductor, PyPI, Conda, GitHub, Bitbucket, a private website
etc). To view the database head to https://www.long-read-tools.org.

## Purpose

This database is designed to be an overview of the currently available long read
analysis software, it is unlikely to be 100% complete or accurate but will be
updated as new software becomes available. If you notice a problem or would like
to add something please make a pull request or open an issue.

## Citation/s

If you find the database useful, please consider citing our [publication](https://doi.org/10.1093/gigascience/giab003) in your work:

*Amarasinghe, S.L., Ritchie, M.E., & Gouil, Q. long-read-tools.org: an interactive catalogue of analysis methods for long-read sequencing data (2020). https://doi.org/10.1093/gigascience/giab003*

A review on long read analysing tools:

*Amarasinghe, S.L., Su, S., Dong, X. et al. Opportunities and challenges in long-read sequencing data analysis. Genome Biol 21, 30 (2020). https://doi.org/10.1186/s13059-020-1935-5*

## Structure

The main tools table has the following columns:

* **Name**
* **Platform** - Programming language or platform where it can be used
* **DOIs** - Publication DOIs separated by semi-colons
* **PubDates** - Publication dates separated with semi-colons. Preprints are
  marked with PREPRINT and will be updated when published.
* **Code** - URL for publicly available code.
* **Description**
* **License** - Software license
* **Technologies in Focus** - Long read sequencing technologies of the 
data available tools are developed for 
* ***Categories*** (Described below)

### Categories

The categories are TRUE/FALSE columns on the `lrs_tools_master.csv` indicating if the software has a
particular function. These are designed to be used as filters, for example when
looking for software to accomplish a particular task. They are also the most
likely to be inaccurate as software is frequently updated and it is hard to
judge all the functions a package has without making significant use of it. You wil see that there 
some tools hve been reported for multiple categories. The
categories are assigned based on whether the tool:
* **Alignment** -  Aligns long reads to a reference
* **Analysis Pipelines** - Is a pipelines that include several tools
* **Basecalling** -  Detects of change of electrical current produced by ONT sequencers and translate it to a DNA sequence
* **Base Modification Detection** - Identifies modifications to individual bases like 5-methylcytosine, 5-hydroxymethylcytosine, and N6-methyladenine in DNA sequences
* **Data Structures** - Alternatie data formats to native long-read storing data formats such as *fast5*
* **Demultiplexing** - Uses barcode or other information to know which sequences came from which samples in a pool of samples
* **Denovo Assembly** - Assembles long reads
* **Error Correction And Polishing** - Corrects the errors to improve the genome assembly or reads before assembly. Some use a hybrid method of using short reads to achieve long reads with high accuracy
* **Evaluating Exisiting Methods** - Benchmarks and/or evaluates functionality of existing tools and/or generating synthetic long read datasets
* **Gap Filling** - Improves existing assemblies based on localised alignment and assembly
* **Gene Expression Analysis** - Tests of differential expression across samples
* **Generating Consensus Sequence** - Generate a consensus sequence from the assembled reads
* **Isoform Detection** - Identifies multiple isoforms encoded by a single gene due to alternative splicing
* **Long Read Overlapping** - Finds pairs of reads that align to each other
* **Metagenomics** - Is used for studying genetic material recovered directly from environmental samples
* **Normalisation** - Removes unwanted variation that may affect results
* **Provide Summary Statistics** - Provides statistics that could be looked at to evaluate the quality of data
* **Quality Checking** - Provides a measure of the quality of the reads
* **Quality Filtering** - Removes low quality reads based on a specified quality threshold
* **Quality Trimming** - Removes low-quality reads
* **Read Quantification** - Quantifies of expression from reads
* **RNA Structure** - Identifies SHAPE modification using nanopore direct RNA sequencing
* **Simulators** - Simulates a sequencing process and produce <i>in-silico</i> reads
* **SNP And Variant Analysis** - Detects or uses variants
* **Suitable For Single Cell Experiments** - Can be used for analysing/processing single-cell data generated by long read sequencing platforms
* **Tested On Human Data** - Provides evidence in publications to have been successfully employed to analyse human data
* **Tested On Non Human Data** - Provides evidence in publications to have been successfully employed to analyse non-human data
* **Visualisation** - Visualises some aspect of long read data or analysis

## Contributors

Thank you to everyone who has contributed to long-read-tools! Your efforts to build
and improve this resource for the community are greatly appreciated!

The following people have made significant contributions to the long-read-tools
database or website:
* [@shaniAmare](https://github.com/shaniAmare) -  Lead designer and developer of the database
* [@mritchieau](https://github.com/mritchie) - Concept of the database and 
suggests new tools
* [@QGouil](https://github.com/QGouil) - Adds new tools and updates existing entries
* [@jlancaster95]([](https://github.com/jlancaster95) - Adds new tools and updates existing entries
* [@EllenConti](https://www.ellenconti.com/about) - For creating a fabulous logo to match our crazy ideas
* [@TamaraJBeck](https://twitter.com/TamaraJBeck?s=20) - Fixed up the super logo
* [@_lazappi_](https://github.com/lazappi) - scRNA-tools source (https://github.com/Oshlack/scRNA-tools) that was re-used for this repository
* [@scottgigante](https://github.com/scottgigante) - Modified plotting code
* [@Lexisomes](https://github.com/alexiswl) - Switch to preferred
  resolver for date to character format
