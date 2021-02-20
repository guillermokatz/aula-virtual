
// drive api requires
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';
// let driveFiles;


// drive auth
function authorize(credentials, callback) {          
    const {client_secret, client_id, redirect_uris} = credentials.installed;          
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);          
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
};
  
function getAccessToken(oAuth2Client, callback) {       
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });  
    console.log('Authorize this app by visiting this url:', authUrl);  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });  
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {              
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
};

module.exports = {

    index: (req, res) => {
      
        // PIDE AUTORIZACION CON LAS CREDENCIALES Y LA FUNCION A AUTORIZAR
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), listFiles);
        });
        
        async function listFiles(auth) {  
          const drive = google.drive({ version: "v3", auth });  
          const filesArray = await getFileList(drive).catch((err) => {
            if (err) console.log(err);
          });  
          res.render('index', {driveFiles: filesArray})
        };
  
        async function getFileList(drive) {
          const res = await drive.files.list({
            pageSize: 300,
            fields: "files(id, name, mimeType, webViewLink, parents)",
          });
          let filesArray = res.data.files;
          filesArray = filesArray.filter ( file => {
            if (file.parents != undefined && file.parents[0] == "1aoQ3ejrmtOgpKIiMqvzZKG05kAxeFDGz") {
              return file
            };
          })
          console.log(filesArray)
          return filesArray
        };
      
    },

    search: (req, res) => {
        // let folderId = req.params.id;
        let inputValue = req.body.query;
        console.log(inputValue)
      
        // PIDE AUTORIZACION CON LAS CREDENCIALES Y LA FUNCION A AUTORIZAR
        fs.readFile('credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);
          authorize(JSON.parse(content), listFiles);
        });
        
        async function listFiles(auth) {
            const drive = google.drive({ version: "v3", auth });
            const filesArray = await getFileList(drive).catch((err) => {
                if (err) console.log(err);
            });
            res.render('search', {driveFiles: filesArray, inputValue})
        };
      
        async function getFileList(drive) {
            const res = await drive.files.list({
                pageSize: 300,
                fields: "files(id, name, mimeType, webViewLink, parents)",
            });
            let filesArray = res.data.files;
            filesArray = filesArray.filter ( file => {
                if (file.parents != undefined && file.name.toLowerCase().includes(inputValue.toLowerCase())) {
                    return file
                };
            })
            console.log(filesArray)
            return filesArray
        };
    
    },

    detail: (req, res) => {        
        let folderId = req.params.id;
        let pageTitle = req.body.folderName;
      
        // PIDE AUTORIZACION CON LAS CREDENCIALES Y LA FUNCION A AUTORIZAR
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), listFiles);
        });                
                    
        async function listFiles(auth) {      
          const drive = google.drive({ version: "v3", auth });      
          const filesArray = await getFileList(drive).catch((err) => {
            if (err) console.log(err);
          });      
          res.render('index', {driveFiles: filesArray, pageTitle})
        };
      
        async function getFileList(drive) {
          const res = await drive.files.list({
            pageSize: 300,
            fields: "files(id, name, mimeType, webViewLink, parents)",
          });
          let filesArray = res.data.files;
          filesArray = filesArray.filter ( file => {
            if (file.parents != undefined && file.parents[0] == folderId) {
              return file
            };
          })
          // console.log(filesArray)
          return filesArray
        };       
      
    }

};