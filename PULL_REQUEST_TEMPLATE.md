The following instructions are for pull requests related to tool entries.
If your pull request is about something else they can be ignored.

Please describe your pull request below and fill out the check list:

**Add your description here**:

**Please check whether you could check following boxes. Else it will break the build of the database!**

- [ ] Only (manually) edited `lrs_tools_master.csv`
- [ ] Tool/pipeline names were added using only "[a-z],{a-}, [0-9], _, -" characters (e.g. no spaces, slashes or tabs)
- [ ] Add 'NOT-MAINTAINED:" or "DEPRECIATED:" to the beginning of the description column of `lrs_tools_master.csv`
- [ ] Completed all columns that needs logical values(i.e. TRUE, FALSE)
- [ ] Add multiple `Programming_Language` separated by commas
- [ ] Check the link of the `Source` you are noting points to the root of the repository only
- [ ] Either have peer-reviewed journal DOI or preprint DOI. Left reference as blank for unpublished
- [ ] Have only one relevant DOI for the tool (we are working on fixing this so you can add many publications seperated by a `;` symbol)
- [ ] Run `build_lrs_db.R` (optional)
