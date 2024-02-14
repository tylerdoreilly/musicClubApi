const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {google} = require('googleapis');
const app = express();
const port = 3080;
const db = require('./queries');
const http = require('http');
const axios = require('axios');
const utility = require('./utilities/formatText');
const seasonHelpers = require('./utilities/season-helpers');
const spotifyQueries = require('./queries/spotify')

// Spotify Ids temp
const SPOTIFY_CLIENT_ID = '51f1ae7a6d2945f982841188295d74bd';
const SPOTIFY_CLIENT_SECRET = '900026f798a742d4b6333cb80a32b0c7';
const lastFmApiKey='ea840f8b2593aebe7317b39734a186ba';

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.use(express.static(path.join(__dirname, '../app/build')));

app.get('/api', async (request, response) => {

    // Google Auth
    const auth = new google.auth.GoogleAuth({
      keyFile:"credentials.json",
      scopes:'https://www.googleapis.com/auth/spreadsheets',
    })
    const client = await auth.getClient();

    // Get Spreadsheet Info
    const googleSheets = google.sheets({version: 'v4', auth:client})

    const spreadsheetID = "1x0BNyTFsMlAmS3DYobETnWZbfcGk8r6JXP7daLUYDwI";

    // Get metaData
    const metaData = await googleSheets.spreadsheets.get({
      auth: auth,
      spreadsheetId:spreadsheetID
    })

    // Get rows
    const getRows = await googleSheets.spreadsheets.values.get({
      auth:auth,
      spreadsheetId: spreadsheetID,
      range:"Week 1"
    })

    //Get All Sheets
    const getAllSheets = await googleSheets.spreadsheets.get({
      auth: auth,
      spreadsheetId:spreadsheetID
    })

    //Get All Sheet Titles
    const tyler = getAllSheets.data.sheets.map((sheet) =>{
      return sheet.properties.title
    })

    const sheetWeeks = getAllSheets.data.sheets.map((sheet) =>{
      let sheetTitle = sheet.properties.title;
      let sheets = {};

      if(sheetTitle.includes("Week")){
        sheets.title = sheet.properties.title;
        sheets.sheetId = sheet.properties.sheetId;
        return sheets
      }     
    })

    const sheet = 'Week 1'
    const albumOne = await googleSheets.spreadsheets.values.batchGet({
      auth:auth,
      spreadsheetId: spreadsheetID,
      ranges: [
        sheet + "!B20:B21",
        sheet + "!A24:B30",
        sheet + "!E30",
        sheet + "!I20:I21",
        sheet + "!H23:I29",
        sheet + "!L30",
        sheet + "!P20:P21",
        sheet + "!023:029",
        sheet + "!S30",
      ]
     
    })

    const weekData = albumOne.data.valueRanges.map((albumData, index) =>{

      if(index === 0 ||index === 1 || index === 2){
        console.log('test')
        albumData.albumNumber = 1;
      }

      if(index === 3 || index === 4 || index === 5){
        albumData.albumNumber = 2;
      }

      if(index === 6 || index === 7 || index === 8){
        albumData.albumNumber = 3;
      }

      return {
        ...albumData
      }
    })

    function getAllWeekData(){
      sheetWeeks.forEach(week =>{

      })
    }

    function buildAlbumData(){
      let albumOne = [];
      let albumTwo = [];
      let albumThree = [];

      weekData.forEach(week =>{

        if(week.albumNumber === 1){
          console.log('1')
          albumOne.push(week.values)
        }
  
        if(week.albumNumber === 2){
          console.log('2')
          albumTwo.push(week.values)
        }
  
        if(week.albumNumber === 3){
          console.log('3')
          albumThree.push(week.values)
        }
      })

      return {
        albumOne,albumTwo,albumThree
      }
    }
   
    const albumData = buildAlbumData()


   

   
    response.send(albumData)
    //response.json({ info: 'Node.js, Express, and Postgres API' })
})

////////////////////////////////////////////////////////////////
// Get Season Data
///////////////////////////////////////////////////////////////

app.get('/api/seasons/', async (request, response) => {

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:'https://www.googleapis.com/auth/spreadsheets',
  })
  const client = await auth.getClient();

  // Get Spreadsheet Info
  const googleSheets = google.sheets({version: 'v4', auth:client})
  const spreadsheetID = "1x0BNyTFsMlAmS3DYobETnWZbfcGk8r6JXP7daLUYDwI";



  //Get All Sheets
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

  let seasonsList = getSeasonsList();

  response.send(seasonsList)
})

app.get('/api/season/:id', async (request, response) => {

  let selectedSeason = request.params.id;
  console.log('param test',selectedSeason)

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:'https://www.googleapis.com/auth/spreadsheets',
  })
  const client = await auth.getClient();

  // Get Spreadsheet Info
  const googleSheets = google.sheets({version: 'v4', auth:client})
  const spreadsheetID = "1x0BNyTFsMlAmS3DYobETnWZbfcGk8r6JXP7daLUYDwI";

  const sheet = selectedSeason.toString();

  let range
  if(sheet === 'Season 1'){
    range = "!A1:L39"
  } else {
    range = "!A1:M46"
  }

  const sheetsOne = await googleSheets.spreadsheets.values.batchGet({
    auth:auth,
    spreadsheetId: spreadsheetID,
    ranges: [
      sheet + range,
    ],
    majorDimension: "COLUMNS",
   
  })

  function formatSeason(){
    let seasonColumns = sheetsOne.data.valueRanges[0].values;
    let albumsList = seasonColumns[0]
    
    return albumsList.map((album, index) =>{
      let albums = {};
      albums.artist = utility.splitTitle(album, 'artist');
      albums.album =  utility.splitTitle(album, 'album');
      albums.avg = getSeasonAlbumAvg(index);
      albums.matt = getSeasonAlbumScores(index,4);
      albums.bill = getSeasonAlbumScores(index,5);
      albums.dan = getSeasonAlbumScores(index,6);
      albums.ty = getSeasonAlbumScores(index,7);
      albums.joel = getSeasonAlbumScores(index,8);
      albums.dwayne = getSeasonAlbumScores(index,9);
      albums.joe = getSeasonAlbumScores(index,10);
      albums.bart = getSeasonAlbumScores(index,11);
      albums.kris = sheet != 'Season 1' ? getSeasonAlbumScores(index,12) : null;
      return albums
    })
   
  }

  function getSeasonAlbumAvg(index){
    let seasonColumns = sheetsOne.data.valueRanges[0].values;
    let avgCol = seasonColumns[2]
    let selected

    avgCol.forEach((item, idx) =>{
      if(index === idx){
        selected = item
       }
    })
    return selected
 

  }

  function getSeasonAlbumScores(index, position){
    let seasonColumns = sheetsOne.data.valueRanges[0].values;
    console.log('test', seasonColumns)
    let userCol = seasonColumns[position]
    let selected

    userCol.forEach((item, idx) =>{
      if(index === idx){
        selected = item
       }
    })
    return selected
 

  }


  let selectedSheet = formatSeason();

  response.send(selectedSheet)
})


////////////////////////////////////////////////////////////////
// Get Week Data
///////////////////////////////////////////////////////////////

app.get('/api/weeks/', async (request, response) => {

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:'https://www.googleapis.com/auth/spreadsheets',
  })
  const client = await auth.getClient();

  // Get Spreadsheet Info
  const googleSheets = google.sheets({version: 'v4', auth:client})
  const spreadsheetID = "1x0BNyTFsMlAmS3DYobETnWZbfcGk8r6JXP7daLUYDwI";



  //Get All Sheets
  const getAllSheets = await googleSheets.spreadsheets.get({
    auth: auth,
    spreadsheetId:spreadsheetID
  })

  //Get All Seasons
  function getWeeksList(){
    let weeks = [];
  
    getAllSheets.data.sheets.forEach(sheet =>{
      let sheetTitle = sheet.properties.title;
     
      if(sheetTitle.includes("Week")){
        let week = {};
        week.title = sheet.properties.title;
        week.value = sheet.properties.title.toLowerCase().replace(/\s/g, "");
        week.sheetId = sheet.properties.sheetId;
        weeks.push(week) 
      }    
      
    })

    return weeks
  }

  let weeksList = getWeeksList();

  response.send(weeksList)
})

app.get('/api/week/:id', async (request, response) => {

  let selectedWeek = request.params.id;

  // Google Auth
  const auth = new google.auth.GoogleAuth({
    keyFile:"credentials.json",
    scopes:'https://www.googleapis.com/auth/spreadsheets',
  })
  const client = await auth.getClient();

  // Get Spreadsheet Info
  const googleSheets = google.sheets({version: 'v4', auth:client})
  const spreadsheetID = "1x0BNyTFsMlAmS3DYobETnWZbfcGk8r6JXP7daLUYDwI";
  const sheet = selectedWeek.toString();

  //Get col and row data
  const albumDataPerWeek = await googleSheets.spreadsheets.values.batchGet({
    auth:auth,
    spreadsheetId: spreadsheetID,
    ranges: [
      sheet + "!B20:B21",
      sheet + "!A23:B31",
      sheet + "!E30",
      sheet + "!I20:I21",
      sheet + "!H23:I31",
      sheet + "!L30",
      sheet + "!P20:P21",
      sheet + "!O23:P31",
      sheet + "!S30",
    ]
   
  })

  const identifyAlbums = albumDataPerWeek.data.valueRanges.map((albumData, index) =>{

    if(index === 0 || index === 1 || index === 2){
      albumData.albumNumber = 1;
    }

    if(index === 3 || index === 4 || index === 5){
      albumData.albumNumber = 2;
    }

    if(index === 6 || index === 7 || index === 8){
      albumData.albumNumber = 3;
    }

    return {
      ...albumData
    }
  })

  const spotifyToken = await getSpotifyAuthToken();


  function buildAlbumData(){
    let albumOne = [];
    let albumTwo = [];
    let albumThree = [];

    identifyAlbums.forEach((week, index) =>{

      if(week.albumNumber === 1){
        albumOne.push(week.values)
      }

      if(week.albumNumber === 2){
        albumTwo.push(week.values)
      }

      if(week.albumNumber === 3){
        albumThree.push(week.values)
      }
    })
   
    return {
      albumOne,albumTwo,albumThree
    }
  }

  let collectedData = buildAlbumData();

  async function formatAlbumData(){
    let albumOneObj = {};
    let albumTwoObj = {};
    let albumThreeObj = {};
    let albumOne = collectedData['albumOne'];
    let albumTwo = collectedData['albumTwo'];
    let albumThree = collectedData['albumThree'];

    albumOneObj.artist = utility.splitTitle(albumOne[0][0][0], 'artist');
    albumOneObj.albumTitle = utility.splitTitle(albumOne[0][0][0], 'album');
    albumOneObj.submittedBy = albumOne[0][1][0].split(":")[1];
    albumOneObj.scores = utility.formatScores(albumOne[1]) ;
    albumOneObj.average = albumOne[2][0][0];
    albumOneObj.albumDetails = null;

    albumTwoObj.artist = utility.splitTitle(albumTwo[0][0][0], 'artist');
    albumTwoObj.albumTitle = utility.splitTitle(albumTwo[0][0][0], 'album');
    albumTwoObj.submittedBy = albumTwo[0][1][0].split(":")[1];
    albumTwoObj.scores = utility.formatScores(albumTwo[1]);
    albumTwoObj.average = albumTwo[2][0][0];
    albumTwoObj.albumDetails = await testTy(albumTwoObj.artist, albumTwoObj.albumTitle, spotifyToken);

    albumThreeObj.artist = utility.splitTitle(albumThree[0][0][0], 'artist');
    albumThreeObj.albumTitle = utility.splitTitle(albumThree[0][0][0], 'album');
    albumThreeObj.submittedBy = albumThree[0][1][0].split(":")[1];
    albumThreeObj.scores = utility.formatScores(albumThree[1]);
    albumThreeObj.average = albumThree[2][0][0];
    albumThreeObj.albumDetails = await testTy(albumThreeObj.artist, albumThreeObj.albumTitle, spotifyToken);

    return albums = [albumOneObj, albumTwoObj, albumThreeObj]

  }

  async function testTy(artist, album, token){
    const artistId = await spotifySearch(artist, album, token);
    let id = artistId.data.artists.items[0].id;
    //console.log('response',artistId.data.artists.items[0].id)

    const testing = await getSpotifyArtistAlbums(id, album, token);
    let albumsList = testing.data.items
    //console.log('albums', albumsList);
    const blahblah = await getSelectedAlbum(albumsList, album);
    //console.log('selected album', blahblah);
    return blahblah
   
  }

  const fromattedAlbumData = await formatAlbumData();

  response.send(fromattedAlbumData);
})


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
  const spotifyToken = await getSpotifyAuthToken();

  async function formatAlbumData(){
    let albumDetails = {}; 
    let searchType = 'artist';

    albumDetails = await getAllData(selectedArtist, selectedAlbum, spotifyToken, searchType);

    if(Object.keys(albumDetails).length === 0){
      console.log('true')
      searchType = 'album'
      albumDetails = await getAllData(selectedArtist, selectedAlbum, spotifyToken, searchType);
      return albumDetails;

    } else {
      return Object.keys(albumDetails).length > 0 ? albumDetails : {}
    }

  }

  async function getAllData(artist, album, token, searchType){
    let musicBrainzData

    const spotifyAlbums = await handleSpotifySearch(artist, album, token, searchType);
    let albumsList = spotifyAlbums

    const spotifyAlbum = await getSelectedAlbum(albumsList, album);
    let selectedAlbum = spotifyAlbum
    let albumId = spotifyAlbum != null ? spotifyAlbum.albumId : null

    if(selectedAlbum != null){
      const trackList = await spotifyQueries.getSpotifyAlbumTracks(albumId, token);
      let tracklist = trackList.data.items
  
      const lastFM = await getLastFmData(artist, album)
      let lastFMData = lastFM.data.album
      let mbId = lastFMData.mbid

      if(mbId){
        const musicBrainz = await getMusicBrainz(mbId)
        musicBrainzData = musicBrainz.data
      }
  
      const audioDb = await getAudioDbAlbum(artist, album)
      let audioDbData = audioDb.data.album
  
      let collectedAlbumData = {
        ...spotifyAlbum,
        tracklist: tracklist,
        lastFm: lastFMData ? lastFMData : [],
        musicBrainz: musicBrainzData ? musicBrainzData : [],
        audioDb: audioDbData ? audioDbData : []
      };
  
      return collectedAlbumData;

    } else {
      return {};
    }
   
  }

  async function handleSpotifySearch(artist, album, token, searchType){
    console.log('artist',artist)

    if (searchType == 'artist') {
      const spotifyArtist = await spotifyQueries.spotifySearchArtists(artist, token);
      let id = spotifyArtist.data.artists.items[0].id;
     
      const spotifyAlbumsList = await spotifyQueries.getSpotifyArtistAlbums(id, token);      
      let albumsList = spotifyAlbumsList.data.items
      return albumsList

    } else {
      const spotifyArtistId = await handleReverseSearch(album, artist, token);

      const spotifyAlbumsList = await spotifyQueries.getSpotifyArtistAlbums(spotifyArtistId, token);      
      let albumsList = spotifyAlbumsList.data.items
      return albumsList

    }
    
  }

  async function handleReverseSearch(album, artist, token){
    const spotifyAlbums = await spotifyQueries.spotifySearchAlbums(album, token);
    let data = spotifyAlbums.data.albums.items;
    console.log('data',data)
    let spotifyArtistId;

    data.forEach(item =>{
      let spotifyArtist = item.artists[0].name

      if (spotifyArtist == artist){       
        spotifyArtistId = item.artists[0].id;
        console.log('selected artist',{name: spotifyArtist, id:spotifyArtistId})
      }
    });

   return spotifyArtistId
  }

  const fromattedAlbumData = await formatAlbumData();

  response.send(fromattedAlbumData);
})




///////////////////////////////////////
// Music API Get Requests
////////////////////////////////////////


// get Spotify album details
const getSpotifyAuthToken = async () => {
  var clientId = SPOTIFY_CLIENT_ID;
  var clientSecret = SPOTIFY_CLIENT_SECRET;
  var auth = Buffer.from(clientId + ":" + clientSecret).toString('base64');

	const response = await axios.request({ 
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
      "Authorization" : "Basic " + auth
    },
    url: "/api/token",
    method: "post",
    baseURL: "https://accounts.spotify.com/", 
    data: "grant_type=client_credentials", 
  })
  return response.data.access_token
};

const spotifySearch = async (artist, token) => {
	const response = axios.get("https://api.spotify.com/v1/search?q=" + artist + "&type=artist&limit=1", {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })
  return response
};

const spotifySearchAlbums = async (album, token) => {
	const response = axios.get("https://api.spotify.com/v1/search?q=" + album + "&type=album&limit=50", {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })
  return response
};

const getSpotifyArtistAlbums = async (artistId, token) => {
console.log('artistId',artistId)
	const response = axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&offset=0&limit=50`, {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })

  return response
};

const getSpotifyAlbumTracks = async (albumId, token) => {

	const response = axios.get("https://api.spotify.com/v1/albums/" + albumId + "/tracks", {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })

  return response
};

const getSelectedAlbum = async (albumsList, album) => {
 //console.log('albumsList',albumsList)

  let albumText = utility.removeSpecialCharacters(album);
  let spotifyDetails = {};
  let artistAlbum;

  console.log('album title',{formattedAlbumName: albumText, regAlbumTitle: album})

  artistAlbum = albumsList.filter(album => {
    let spotifyAlbumName = utility.removeSpecialCharacters(album.name);
    let matchedTitle = spotifyAlbumName == albumText;

    if (matchedTitle){
      console.log('found match?', true)
      return album
      
    } else if(spotifyAlbumName.includes(albumText)){
      console.log('found match by include?', true)
      return album
    }
  });

  let selectedAlbum = artistAlbum[0]

 // console.log('fuckMyAss',selectedAlbum)


  // if (artistAlbum === undefined) {
  //   artistAlbum = albumsList.find(album => album.name.toLowerCase().includes(albumText));
  // }

  // if (artistAlbum === undefined) {
  //   artistAlbum = albumsList.find(album => {
  //     let albumTitle = album.name;
  //     let cleanName = albumTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  //     return cleanName.includes(albumText)
  //   });
  // }

  //console.log('artist album',artistAlbum)

  if (selectedAlbum != undefined){
    spotifyDetails.albumCover = getAlbumCover(selectedAlbum);
    spotifyDetails.albumLink = getSpotifyLink(selectedAlbum);
    spotifyDetails.albumTracks = selectedAlbum.total_tracks;
    spotifyDetails.albumDate = utility.formatAlbumDate(selectedAlbum.release_date);
    spotifyDetails.albumId = selectedAlbum.id;

    return spotifyDetails

  } else {
    return null
  }
 
}

function getAlbumCover(album){
 // console.log('album',album)
  let albumImages = album.images;
  let albumImage = albumImages.find(album => album.height == "300").url

  return albumImage;
}

function getSpotifyLink(album){
  let albumLink = album.external_urls.spotify;

  return albumLink;
}


///////////////////////////////////////
// Music Brainz API Requests
////////////////////////////////////////

const getMusicBrainz = async (mbId) => {
  try {
    const response = axios.get(`http://musicbrainz.org/ws/2/release/${mbId}?inc=artist-credits+labels+discids+recordings`, {   
      headers:{
        "contentType": "application/json",
      },
    })
  
    return response
  } catch (error) {
    console.log(error.response); // this is the main part. Use the response property from the error object
    
    return error.response;
  }

	
};



/////////////////////////////////////////////////
// Get AudioDB Data

const getAudioDbAlbum = async (artistName, albumName ) => {

	const response = axios.get(`https://www.theaudiodb.com/api/v1/json/523532/searchalbum.php?s=${artistName}&a=${albumName}`, {   
    headers:{
      "contentType": "application/json",
    },
  })

  return response
};




/////////////////////////////////////////////////
// Get Last FM Data

const getLastFmData = async (artistName, albumName ) => {
	const response = axios.get(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${lastFmApiKey}&artist=${artistName}&album=${albumName}&format=json`, {   
    headers:{
      "contentType": "application/json",
    },
  })

  return response
};

const getLastFmAlbumById = async (artistMBID) => {
	const response = axios.get(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&mbid=${artistMBID}&api_key=${lastFmApiKey}&format=json`, {   
    headers:{
      "contentType": "application/json",
    },
  })

  return response
};


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
