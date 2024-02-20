const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();
const { envPort, env, spreadsheetId } = require('./config');
const port = process.env.PORT || envPort;
const utility = require('./utilities/formatText');
const seasonHelpers = require('./utilities/season-helpers');
const albumControls = require("./controllers/album.controller.js");
const songControls = require("./controllers/song.controller.js");

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.use(express.static(path.join(__dirname, '../app/build')));

console.log(`Your environment is ${env}`);


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
  const spreadsheetID = spreadsheetId;

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
  let collectAllData = [];
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
 
  seasonsData.forEach(items =>{
    items.shift();
    items.forEach(item =>{
      collectAllData.push(item)
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
      albums.season = seasonHelpers.getSeasonNumber(seasonNumber);
      albums.avg = seasonHelpers.getSeasonAlbumAvg(index, season);
      albums.matt = seasonHelpers.getSeasonAlbumScores(index,4, season);
      albums.bill = seasonHelpers.getSeasonAlbumScores(index,5, season);
      albums.dwayne = (seasonNumber != 'Season 1' && seasonNumber != 'Season 2') ? seasonHelpers.getSeasonAlbumScores(index,6, season) : seasonHelpers.getSeasonAlbumScores(index,9, season);
      albums.ty = seasonHelpers.getSeasonAlbumScores(index,7, season);
      albums.joel = seasonHelpers.getSeasonAlbumScores(index,8, season);
      albums.dan = (seasonNumber != 'Season 1' && seasonNumber != 'Season 2') ? seasonHelpers.getSeasonAlbumScores(index,9, season) : seasonHelpers.getSeasonAlbumScores(index,6, season) ;
      albums.joe = seasonHelpers.getSeasonAlbumScores(index,10, season);
      albums.bart = seasonHelpers.getSeasonAlbumScores(index,11, season);
      albums.kris = seasonNumber != 'Season 1' ? seasonHelpers.getSeasonAlbumScores(index,12, season) : null;
      return albums
    })
   
  }

  response.send(collectAllData)
})

app.get('/api/album', async (request, response) => {

  let selectedAlbum = request.query.albumName;
  let selectedArtist = request.query.artistName; 

  const fromattedAlbumData = await albumControls.formatAlbumData(selectedArtist, selectedAlbum);

  response.send(fromattedAlbumData);
})


////////////////////////////////////////////////////////////////
// Get Song Data
///////////////////////////////////////////////////////////////

app.get('/api/songs', async (request, response) => {

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:'https://www.googleapis.com/auth/spreadsheets',
  })
  const client = await auth.getClient();

  // Get Spreadsheet Info
  const googleSheets = google.sheets({version: 'v4', auth:client})
  const spreadsheetID = spreadsheetId;

  // Get All Sheets
  const getAllSheets = await googleSheets.spreadsheets.get({
    auth: auth,
    spreadsheetId:spreadsheetID
  })

  //Get All Seasons
  function getSongsList(){
    let brackets = [];
  
    getAllSheets.data.sheets.forEach(sheet =>{
      let sheetTitle = sheet.properties.title;
     
      if(sheetTitle.includes("Bracketeering")){
        let bracket = {};
        bracket.title = sheet.properties.title;
        bracket.value = sheet.properties.title.toLowerCase().replace(/\s/g, "");
        bracket.sheetId = sheet.properties.sheetId;
        brackets.push(bracket) 
      }    
      
    })

    return brackets
  }

  let allBrackets = getSongsList();

  let sheetsList = [];
  let range = "!B1:B400";

  allBrackets.forEach(bracket =>{
    sheetsList.push(bracket.title + range)
  })

  let bracketsAllData = await googleSheets.spreadsheets.values.batchGet({
    auth:auth,
    spreadsheetId: spreadsheetID,
    ranges: sheetsList,
    majorDimension: "COLUMNS",   
  })

  const bracketsData = bracketsAllData.data.valueRanges.map((bracket, index) =>{
    let bracketSongs = songControls.formatBracket(bracket.values, index);
    return bracketSongs
  })

  console.log('bracketsData',bracketsData)
  let collectAllData = [];
  
  bracketsData.forEach(items =>{
    items.forEach(item =>{
      collectAllData.push(item)
    })
  })

  response.send(collectAllData)
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
