const albumHelpers = require('../utilities/album-helpers');
const spotifyQueries = require('../queries/spotify');
const albumSources = require('../queries/album-sources');
const utility = require('../utilities/formatText');

const formatBracket = (bracket, idx) =>{
    let cleanUpArray = bracket[0].filter(n => n)
    //console.log('passed season', cleanUpArray[0])
     let bracketList = bracket[0]
 
     return cleanUpArray.map((song, index) =>{
       let songs = {};
       let dataObj = utility.splitSongString(song);
       songs.artist = dataObj.artist;
       songs.song = dataObj.album;
       songs.bracket = idx +1;
       
       return songs
     })
    
}
module.exports = {
    formatBracket
}