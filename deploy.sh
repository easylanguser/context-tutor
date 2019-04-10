echo -e "Starting script"
echo -e "Building www"
ionic cordova build browser
echo -e "www has built"
echo -e "Copying files to vm"
scp -r www/  root@46.101.122.247:/var/www/html
echo -e "Files have copied"

