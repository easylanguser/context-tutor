echo -e "Starting script"
echo -e "Building www"
ionic cordova build browser
echo -e "www has built"
echo -e "Copying files to vm"
scp -r www/  root@165.227.159.35:/home/tutor/
echo -e "Files have copied"

