const getSeasonAlbumAvg = (index,season) => {
    let seasonColumns = season;
    let avgCol = seasonColumns[2];
    let selected

    avgCol.forEach((item, idx) =>{
      if(index === idx){
        selected = converToInteger(item);
      }
    });

    return selected
}

const getSeasonAlbumScores = (index, position, season) => {
    let seasonColumns = season;
    let userCol = seasonColumns[position];
    let albumScore;

    userCol.forEach((score, idx) => {
        if(index === idx){
          albumScore = converToInteger(score);
        }
    });

    return albumScore;
}

const getSeasonNumber = (season) => {
  let seasonNumber = season.replace('Season','');
  return Number(seasonNumber)
}

const converToInteger = (item) => {
  return item && item != '#DIV/0!' ? Number(item) : 0;
}

module.exports = {
    getSeasonAlbumAvg,
    getSeasonAlbumScores,
    getSeasonNumber
}