const albumHelpers = require('../utilities/album-helpers');
const spotifyQueries = require('../queries/spotify');
const albumSources = require('../queries/album-sources');


async function formatAlbumData(selectedArtist, selectedAlbum){
    const spotifyToken = await spotifyQueries.getSpotifyAuthToken();
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

const spotifyAlbum = await albumHelpers.getSelectedAlbum(albumsList, album);
let selectedAlbum = spotifyAlbum
let albumId = spotifyAlbum != null ? spotifyAlbum.albumId : null

if(selectedAlbum != null){
    const trackList = await spotifyQueries.getSpotifyAlbumTracks(albumId, token);
    let tracklist = trackList.data.items

    const lastFM = await albumSources.getLastFmData(artist, album)
    let lastFMData = lastFM.data.album
    let mbId = lastFMData.mbid

    if(mbId){
    const musicBrainz = await albumSources.getMusicBrainz(mbId)
    musicBrainzData = musicBrainz.data
    }

    const audioDb = await albumSources.getAudioDbAlbum(artist, album)
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

module.exports = {
    formatAlbumData
}