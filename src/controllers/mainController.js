
// drive api requires
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json';
// let driveFiles;

function filterFileType(filesArray) {
  return filesArray.filter ( file => {
    switch (file.mimeType) {
      case 'application/pdf':
        file.mimeType = 'pdf'
        break;
      case 'video/mp4':
        file.mimeType = 'video'
        break;
      case 'image/jpeg':
        file.mimeType = 'img'
        break;
      case 'image/png':
        file.mimeType = 'img'
        break;
      case 'application/octet-stream':
        file.mimeType = 'doc'
        break;
      case 'audio/mpeg':
        file.mimeType = 'video'
        break;
      case 'audio/mp3':
          file.mimeType = 'video'
          break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        file.mimeType = 'ppt'
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        file.mimeType = 'doc'
        break;
      case 'application/vnd.google-apps.document':
        file.mimeType = 'doc'
        break;
    };
    return file
  })
}


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
          // res.send(filesArray)
          res.render('index', {driveFiles: filesArray})
        };
  
        async function getFileList(drive) {
          const res = await drive.files.list({
            pageSize: 1000,
            q: "'1aoQ3ejrmtOgpKIiMqvzZKG05kAxeFDGz' in parents",
            fields: "files(id, name, mimeType, webViewLink, parents)",
          });
          let filesArray = res.data.files;
          filesArray = filterFileType(filesArray);
          // filesArray = filesArray.filter ( file => {
          //   if (file.parents != undefined && file.parents[0] == "1aoQ3ejrmtOgpKIiMqvzZKG05kAxeFDGz") {
          //     return file
          //   };
          // })
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
              q: `name contains '${inputValue}' `,
              pageSize: 1000,
              fields: "files(id, name, mimeType, webViewLink, parents)",
            });
            let filesArray = res.data.files;
            // CHECK IF IT IS INSIDE A FOLDER
            filesArray = filesArray.filter ( file => {
                if (file.parents != undefined) {
                    return file
                };
            });
            filesArray = filterFileType(filesArray);
            // filesArray = filesArray.filter ( file => {
            //     if (file.parents != undefined && file.name.toLowerCase().includes(inputValue.toLowerCase())) {
            //         return file
            //     };
            // })
            
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
            q: `'${folderId}' in parents`,
            pageSize: 1000,
            fields: "files(id, name, mimeType, webViewLink, parents)",
          });
          let filesArray = res.data.files;
          filesArray = filterFileType(filesArray);
          console.log(filesArray)
          // filesArray = filesArray.filter ( file => {
          //   if (file.parents != undefined && file.parents[0] == folderId) {
          //     return file
          //   };
          // })
          // console.log(filesArray)
          return filesArray
        };       
      
    },

    info: (req, res) => {
      res.render('about')
    },

    programa: (req, res) => {
      res.render('programa')
    }

};