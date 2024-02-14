const axios = require('axios');

//Temp lastFm key - move to env
const lastFmApiKey='ea840f8b2593aebe7317b39734a186ba';


///////////////////////////////////////
// Music Brainz API Requests

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

module.exports = {
    getMusicBrainz,
    getAudioDbAlbum,
    getLastFmData
}