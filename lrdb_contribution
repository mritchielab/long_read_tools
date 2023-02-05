#clone fork to local machine
git clone https://github.com/jlancaster95/long_read_tools.git
cd long_read_tools
#add mritchie lab master as upstream
git remote add upstream https://github.com/mritchielab/long_read_tools.git
#update my fork to upstream
git fetch upstream
git checkout master
git merge upstream/master
git push 
#once updates to database csv. file have been made, build and check database
cd ~/Documents/long-read-tools
Rscript build_lrs_db.R 
python docs/test_server.py
#Got to http://127.0.0.1:5000/index.html to check
#If happy, push to fork and then request merge with the upstream official mritchielab repo.
git add *
git commit -m "database build updated"
git push