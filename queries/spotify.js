const axios = require('axios');
const { spotifyClientId, spotifyClientSecret } = require('../config');

// Spotify Ids
const SPOTIFY_CLIENT_ID = spotifyClientId;
const SPOTIFY_CLIENT_SECRET = spotifyClientSecret;


// Generate Spotify Auth Token
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

// Search Spotify by Artists
const spotifySearchArtists = async (artist, token) => {
	const response = axios.get("https://api.spotify.com/v1/search?q=" + artist + "&type=artist&limit=1", {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })
  return response
};

// Search Spotify by Albums
const spotifySearchAlbums = async (album, token) => {
	const response = axios.get("https://api.spotify.com/v1/search?q=" + album + "&type=album&limit=50", {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })
  return response
};

// Get Spotify Artist Albums
const getSpotifyArtistAlbums = async (artistId, token) => {
    const response = axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&offset=0&limit=50`, {   
        headers:{
            "contentType": "application/json",
            'Authorization': "Bearer " + token
        },
    })
    
    return response
};

// Get Spotify Artist Album Tracks
const getSpotifyAlbumTracks = async (albumId, token) => {
	const response = axios.get("https://api.spotify.com/v1/albums/" + albumId + "/tracks", {   
    headers:{
      "contentType": "application/json",
      'Authorization': "Bearer " + token
    },
  })

  return response
};



module.exports = {
    getSpotifyAuthToken,
    spotifySearchArtists,
    spotifySearchAlbums,
    getSpotifyArtistAlbums,
    getSpotifyAlbumTracks
}