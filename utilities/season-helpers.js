function getSeasonAlbumAvg(index,season){
    let seasonColumns = season;
    let avgCol = seasonColumns[2];
    let selected

    avgCol.forEach((item, idx) =>{
      if(index === idx){
        selected = item
      }
    });

    return selected
}

function getSeasonAlbumScores(index, position,season){
    let seasonColumns = season;
    let userCol = seasonColumns[position];
    let selected;

    userCol.forEach((item, idx) =>{
        if(index === idx){
        selected = item
        }
    });

return selected
}


module.exports = {
    getSeasonAlbumAvg,
    getSeasonAlbumScores,
}