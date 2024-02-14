const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {google} = require('googleapis');
const app = express();
const port = 3080;
const utility = require('./utilities/formatText');
const seasonHelpers = require('./utilities/season-helpers');
const albumControls = require("./controllers/album.controller.js");

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.use(express.static(path.join(__dirname, '../app/build')));


////////////////////////////////////////////////////////////////
// Get Album Data
///////////////////////////////////////////////////////////////


app.get('/api/albums/', async (request, response) => {

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:'https://www.googleapis.com/auth/spreadsheets',
  })
  const client = await auth.getClient();

  // Get Spreadsheet Info
  const googleSheets = google.sheets({version: 'v4', auth:client})
  const spreadsheetID = "1x0BNyTFsMlAmS3DYobETnWZbfcGk8r6JXP7daLUYDwI";

  // Get All Sheets
  const getAllSheets = await googleSheets.spreadsheets.get({
    auth: auth,
    spreadsheetId:spreadsheetID
  })

  //Get All Seasons
  function getSeasonsList(){
    let seasons = [];
  
    getAllSheets.data.sheets.forEach(sheet =>{
      let sheetTitle = sheet.properties.title;
     
      if(sheetTitle.includes("Season")){
        let season = {};
        season.title = sheet.properties.title;
        season.value = sheet.properties.title.toLowerCase().replace(/\s/g, "");
        season.sheetId = sheet.properties.sheetId;
        seasons.push(season) 
      }    
      
    })

    return seasons
  }

  let allSeasons = getSeasonsList();

  let sheetsList = [];
  let range = "!A1:M50";

  allSeasons.forEach(season =>{
    sheetsList.push(season.title + range)
  })

  let seasonsAllData = await googleSheets.spreadsheets.values.batchGet({
    auth:auth,
    spreadsheetId: spreadsheetID,
    ranges: sheetsList,
    majorDimension: "COLUMNS",   
  })

  const seasonsData = seasonsAllData.data.valueRanges.map((season, index) =>{
    let seasonAlbums = formatSeason(season.values);

    return seasonAlbums 
  })

  let test = [];
  seasonsData.forEach(items =>{
    items.shift();
    items.forEach(item =>{
      test.push(item)
    })
  })

  function formatSeason(season){

   // console.log('passed season', season)
    let albumsList = season[0]
    let seasonNumber = albumsList.find(season => season[0]);

    return albumsList.map((album, index) =>{
      let albums = {};
      let dataObj = utility.splitString(album);
      albums.artist = dataObj.artist;
      albums.album = dataObj.album;
      albums.by = dataObj.member;
      albums.season = seasonNumber;
      albums.avg = seasonHelpers.getSeasonAlbumAvg(index, season);
      albums.matt = seasonHelpers.getSeasonAlbumScores(index,4, season);
      albums.bill = seasonHelpers.getSeasonAlbumScores(index,5, season);
      albums.dan = seasonHelpers.getSeasonAlbumScores(index,6, season);
      albums.ty = seasonHelpers.getSeasonAlbumScores(index,7, season);
      albums.joel = seasonHelpers.getSeasonAlbumScores(index,8, season);
      albums.dwayne = seasonHelpers.getSeasonAlbumScores(index,9, season);
      albums.joe = seasonHelpers.getSeasonAlbumScores(index,10, season);
      albums.bart = seasonHelpers.getSeasonAlbumScores(index,11, season);
      albums.kris = seasonNumber != 'Season 1' ? seasonHelpers.getSeasonAlbumScores(index,12, season) : null;
      return albums
    })
   
  }

   response.send(test)
})

app.get('/api/album', async (request, response) => {

  let selectedAlbum = request.query.albumName;
  let selectedArtist = request.query.artistName; 

  const fromattedAlbumData = await albumControls.formatAlbumData(selectedArtist, selectedAlbum);

  response.send(fromattedAlbumData);
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});