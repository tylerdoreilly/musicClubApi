const utility = require('./formatText');

///////////////////////////////////////////////////////////////////////
// Build Album Data Helper
///////////////////////////////////////////////////////////////////////

const getSelectedAlbum = async (albumsList, album) => {
    //console.log('albumsList',albumsList)
   
     let albumText = utility.removeSpecialCharacters(album);
     let spotifyDetails = {};
     let artistAlbum;
   
     //console.log('album title',{formattedAlbumName: albumText, regAlbumTitle: album})
   
     artistAlbum = albumsList.filter(album => {
       let spotifyAlbumName = utility.removeSpecialCharacters(album.name);
       let matchedTitle = spotifyAlbumName == albumText;

       console.log('album title',{formattedAlbumName: albumText, formattedAlbumTitle: spotifyAlbumName})
       console.log('match',{matchedTitle})
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
    let albumImages = album.images;
    let albumImage = albumImages.find(album => album.height == "300").url
    return albumImage;
}
   
function getSpotifyLink(album){
    let albumLink = album.external_urls.spotify;
    return albumLink;
}


module.exports = {
    getSelectedAlbum
}