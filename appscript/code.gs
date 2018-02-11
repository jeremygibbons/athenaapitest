function QUERYATHENAALAB(query) {
  query = query || "select numerocartebadge, immatriculation, date, heure, libellearticle, qte_kg, codechauffeur, kilometrage, nomsite, bio from alabcsvdata where numerodeclient='10009'";
  
  // options used to be able to perform HTTP POST to trigger the query
  var options = {
   'method' : 'post',
   'contentType': 'application/json',
    'payload' : JSON.stringify({ 'query': query})
  };
  
  // Start the query and retrieve the QueryExecutionId
  var response = UrlFetchApp.fetch("https://d659yysa1h.execute-api.eu-west-1.amazonaws.com/prod/queryexec/start", options);
  var queryId = JSON.parse(response.getContentText())['QueryExecutionId'];
  
  // Poll the query execution status until the query is completed
  var execTime = 0; 
  while(execTime < 5000) {
    // Get the status
    var statusresponse = UrlFetchApp.fetch("https://d659yysa1h.execute-api.eu-west-1.amazonaws.com/prod/queryexec?queryId=" + queryId);
    status = JSON.parse(statusresponse.getContentText())['QueryExecution']['Status']['State'];
    
    // If the status is SUCCEEEDED, retrieve results and parse them
    if(status == 'SUCCEEDED') {
      var dataresponse = UrlFetchApp.fetch("https://d659yysa1h.execute-api.eu-west-1.amazonaws.com/prod/queryresults?queryId=" + queryId);
      
      
      // The results contain a header row, which we remove by shifting
      j.shift();
      
      // Read the types of the data in the JSON results
      var t = JSON.parse(dataresponse.getContentText())['ResultSet']['ResultSetMetadata']['ColumnInfo'];
      var typ = t.map(function (row) {
        return row['Type'];
      });
      
      // Read the results, and generate an array that will be readable by Google Sheets, parsing relevant values
      // into usable types (mainly for ints, floats and dates)
      var j = JSON.parse(dataresponse.getContentText())['ResultSet']['Rows'];
      var res = j.map(function (row) {
        return row['Data'].map(function (data, index) {
          if(typ[index] == 'date') return Date(data['VarCharValue']);
          if(typ[index] == 'double') return parseFloat(data['VarCharValue']);
          if(typ[index] == 'integer') return parseInt(data['VarCharValue']);
          return data['VarCharValue'];
        });
      });
      
      return res;
      
    // If the status is that the query is still pending, wait for 1 second before polling again.  
    } else if (status == 'RUNNING' || status == 'QUEUED') {
      Utilities.sleep(1000);
      execTime += 1000;
    
    // For any other status (e.g. CANCELLED) return failure.
    } else {
      return "Query failed";
    }
  }
}
