function formatScores(scores){
    let scoresCollection = [];
    let cleanScores = scores.filter(e => e.length);
    
    cleanScores.forEach(score =>{ 
      let obj = {};        
      let user = score[0]
      let userScore = score[1]  
      obj.score = userScore
      obj.user = user
      scoresCollection.push(obj)
    })

    return scoresCollection
}

function splitTitle(album, type){
    if(album.length || album != ' '){
      if(type === 'artist'){
        return album.substring(0, album.indexOf("-")).trimEnd();
      }
      if(type === 'album'){
        return album.substring(album.indexOf('-') + 1).trimStart();
      }
     
    }
}

function splitString(string){
  let obj = {};
  const regex = /(?<=\s)-(?=\s)/gm;
  const subst = '#';
  const result = string.replace(regex, subst);

  let artist
  let albumAndUser
  let member
  let album

  artist = result.substring(0,result.indexOf("#")).trimEnd();
  albumAndUser = result.substring(result.indexOf('#') + 1).trimStart();

  if(albumAndUser.includes('#')){

    album = albumAndUser.substring(0, albumAndUser.indexOf("#")).trimEnd();
    member = albumAndUser.substring(albumAndUser.indexOf('#') + 1).trimStart();

  } else {
    album = albumAndUser
    member = "n/a"
  }

  obj.artist = artist;
  obj.album = album;
  obj.member = member;

  return obj
}

function splitSongString(string){
  let obj = {};
  const regex = /(?<=\s)-(?=\s)/gm;
  const subst = '#';
  const result = string.replace(regex, subst);

  let artist = string.replace(/".*"/g, '');
  let song = result.substring(result.indexOf("#") + 1).trimStart();


  if(artist.includes('-')){
    artist = string.substring(0, artist.indexOf("-")).trimEnd();
  }

  if(song.includes('-')){
    song = song.substring(song.indexOf("-") + 1).trimStart();
  } 
  
  else if (song.indexOf('"')){
    song = song.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, "");
  }

  if(song.includes('"')){
    song = song.replace(/['"]+/g, '');
  }

  obj.artist = artist;
  obj.album = song

  return obj
}

function formatAlbumDate(albumDate){
  // if(albumDate.includes('-')){
  //   return albumDate.substring(0, albumDate.indexOf("-")).trimEnd();
  // } else {

  // }
  return albumDate.includes('-') ? 
    albumDate.substring(0, albumDate.indexOf("-")).trimEnd() :
    albumDate
}

function formatAlbumTitle(album){
  let albumTitle = album.toLowerCase();

  if(albumTitle.includes('...')){
    return albumTitle.substring(albumTitle.indexOf('...') + 3).trimStart();
  }else {
    return albumTitle
  }
}

function removeSpecialCharacters(album){
  let albumTitle = album.toLowerCase();
  let formattedTitle = albumTitle.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
  return formattedTitle
}


module.exports = {
  formatScores,
  splitTitle,
  splitString,
  formatAlbumDate,
  formatAlbumTitle,
  removeSpecialCharacters,
  splitSongString
}