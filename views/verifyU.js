
function verify(user_uuid){
  

const db = require("c:/Users/moham/OneDrive/Desktop/Winter2022/twat1/soen390/database");
      
  
db.connect(function(err) {
  if (err) throw err;
  var sql = "UPDATE Worker SET verified =  1  WHERE ( user_uuid  =  "+user_uuid+" );";
  db.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});}

verify(1);