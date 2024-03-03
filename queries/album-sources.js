const axios = require('axios');
const { lastFMKey } = require('../config');

//lastFm key
const lastFmApiKey = lastFMKey;


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

const getLastFmTopTags = async (artistName, albumName ) => {
  const response = axios.get(`http://ws.audioscrobbler.com/2.0/?method=album.gettoptags&api_key=${lastFmApiKey}&artist=${artistName}&album=${albumName}&format=json`, {   
  headers:{
  "contentType": "application/json",
  },
})

return response
};

const getWikiData = async (id) => {
  const response = axios.get(`http://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&format=json&origin=*`, {   
  headers:{
  "contentType": "application/json",
  },
})

return response
};

/////////////////////////////////////////////////
// Discogs Data
const searchDiscogs = async (artistName, albumName ) => {
  const response = axios.get(`https://api.discogs.com/database/search?release_title=${albumName}&artist=${artistName}&per_page=3&page=1`, {   
    headers:{
    "contentType": "application/json",
    'Authorization':'Discogs key=WyjWetuEyBteuiyCywsC, secret=ekbVQoJtxUSgqueJYtJUfEoqjJezrUmj'
    },
  })

  return response
};

const getDiscogsMaster = async ( discogsId ) => {
  const response = axios.get(`https://api.discogs.com/masters/${discogsId}`, {   
    headers:{
    "contentType": "application/json",
    'Authorization':'Discogs key=WyjWetuEyBteuiyCywsC, secret=ekbVQoJtxUSgqueJYtJUfEoqjJezrUmj'
    },
  })
  return response
};

const getDiscogsRelease = async ( releaseId ) => {
  const response = axios.get(`https://api.discogs.com/releases/${releaseId}`, {   
    headers:{
    "contentType": "application/json",
    'Authorization':'Discogs key=WyjWetuEyBteuiyCywsC, secret=ekbVQoJtxUSgqueJYtJUfEoqjJezrUmj'
    },
  })

  return response
};


module.exports = {
    getMusicBrainz,
    getAudioDbAlbum,
    getLastFmData,
    getLastFmTopTags,
    getWikiData,
    getDiscogsMaster,
    getDiscogsRelease,
    searchDiscogs
}