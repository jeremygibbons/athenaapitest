function QUERYATHENAALAB(query) {
  query = query || "select numerocartebadge, immatriculation, date, heure, libellearticle, qte_kg, codechauffeur, kilometrage, nomsite, bio from alabcsvdata where numerodeclient='10009'";
  var options = {
   'method' : 'post',
   'contentType': 'application/json',
    'payload' : JSON.stringify({ 'query': query})
 };
   
  var response = UrlFetchApp.fetch("https://d659yysa1h.execute-api.eu-west-1.amazonaws.com/prod/queryexec/start", options);
  var queryId = JSON.parse(response.getContentText())['QueryExecutionId'];
  
  var execTime = 0;
  
  while(execTime < 5000) {
    var statusresponse = UrlFetchApp.fetch("https://d659yysa1h.execute-api.eu-west-1.amazonaws.com/prod/queryexec?queryId=" + queryId);
    status = JSON.parse(statusresponse.getContentText())['QueryExecution']['Status']['State'];
    
    if(status == 'SUCCEEDED') {
      var dataresponse = UrlFetchApp.fetch("https://d659yysa1h.execute-api.eu-west-1.amazonaws.com/prod/queryresults?queryId=" + queryId);
      var j = JSON.parse(dataresponse.getContentText())['ResultSet']['Rows'];
      j.shift();
      var t = JSON.parse(dataresponse.getContentText())['ResultSet']['ResultSetMetadata']['ColumnInfo'];
      var typ = t.map(function (row) {
        return row['Type'];
      });
      var res = j.map(function (row) {
        return row['Data'].map(function (data, index) {
          if(typ[index] == 'date') return Date(data['VarCharValue']);
          if(typ[index] == 'double') return parseFloat(data['VarCharValue']);
          if(typ[index] == 'integer') return parseInt(data['VarCharValue']);
          return data['VarCharValue'];
        });
      });
      return res;
    } else if (status == 'RUNNING' || status == 'QUEUED') {
      Utilities.sleep(1000);
      execTime += 1000;
    
    } else {
      return "Query failed";
    }
  }
}
