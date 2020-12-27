var testFolder = '../data/';
const fs = require('fs');

/*
fs.readdir(testFolder, (err, files)=>{
  files.forEach((file, i) => {
    console.log(file);
  });
});
*/


  fs.readdir(testFolder, function(err, filelist){
    console.log(filelist);


  });
