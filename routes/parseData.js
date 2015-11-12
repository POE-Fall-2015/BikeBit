function randInt(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

var getUserStats = function(req, res){
  var stats = {"canAccess":false, distToGo:randInt(0,50), progress:30, lifetimeTotal:300};
  res.status(200).json(stats);
}

module.exports.getUserStats = getUserStats;
