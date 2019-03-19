//search helper function executes the NASA API Search GET Request
function search(query, sd, ed, loc, phot, id)
{

  emptydiv();
  //use ajax
  var getrequest = "https://images-api.nasa.gov/search?media_type=image";

  if(query.localeCompare("") != 0)
  {
    getrequest += "&q=" + query;
  }
  //date parsing
  var year;
  var smonth;
  var emonth;
  var sday;
  var eday;
  if(sd.localeCompare("") != 0)
  {
    //parse date into year,month,day
    if(sd.length >= 4)
    {
      year = sd.substring(0,4);
    }
    
    getrequest += "&year_start=" + year;
  }
  
  if(ed.localeCompare("") != 0)
  {
    //parse date into year,month,day
    if(ed.length >= 4)
    {
      year = ed.substring(0,4);
    }
    getrequest += "&year_end=" + year;
  }
  if(loc.localeCompare("") != 0)
  {
    getrequest += "&location=" + loc;
  }
  if(phot.localeCompare("") != 0)
  {
    getrequest += "&photographer=" + phot;
  }
  if(id.localeCompare("") != 0)
  {
    getrequest += "&nasa_id=" + id;
  }
  
  //alert(getrequest);
  //search GET request (ajax)
  $.get(getrequest, function( data ) {
    $( "#result" ).html( data );
    parsejson(data, sd, ed);
  });
}



//emptydiv clears all the previous data upon a new search
function emptydiv()
{
  $("#row1").empty();
  $("#row2").empty();
  $("#numresult").empty();
}
//emptytag 
function textboxtag(tag)
{
  //$('label[id*=query').html('');
  $("#query").val("\'" + tag + "\'");
}

//parse helper function converts formatted json into html
function parsejson(data, sd, ed)
{
  var i;
  var count = 0;
  var html;

  //output number of results
  html = document.getElementById("numresult");
  html.innerHTML += "<h6> Your search produced <b>" + 
                    data.collection.items.length + "</b> results: </h6>";
  
  console.log(html);
  
  //traverse through all the results
  for(i = 0; i < data.collection.items.length; i++)
  {

    var HTMLelements = "";
    var obj = data.collection.items[i];
    var type = obj.data[0].media_type;
    
    //three column output
    if(count % 2 == 0)
    {
      html = document.getElementById("row1");
    }
    else
    {
      html = document.getElementById("row2");
    }
    var show = true;
    //only show if in date range
    var date = obj.data[0].date_created;
    if(date.length >= 10) 
    {
      date = date.substring(0,10);
      var year = date.substring(0,4);
      var month = date.substring(5,7)
      var day = date.substring(8,10);
    }
    if(sd.length >= 10)
    {
      var syear = sd.substring(0,4);
      var smonth = sd.substring(5,7)
      var sday = sd.substring(8,10);

      if(syear == year)
      {
        if(smonth < month)
        {
          show = false;
        }
        if(smonth == month && sday < day)
        {
          show = false;
        }
      }
    }
    if(ed.length >= 10)
    {
      var eyear = ed.substring(0,4);
      var emonth = ed.substring(5,7)
      var eday = ed.substring(8,10);
      if(eyear == year)
      {
        if(emonth > month)
        {
          show = false;
        }
        if(emonth == month && eday > day)
        {
          show = false;
        }
      }
    }
    //show results
    if(show)
    {
      HTMLelements += "<h6> Title: <b>" + obj.data[0].title + "</b></h6>";
      //showmoredetailsbutton
      HTMLelements += "<button id=\"bm" + count + 
                      "\" onclick=\"toggleDetails(this.id)\" > Show Details </button>";
      //parse optional details:
      HTMLelements += "<div id=\"more" + count + "\"> " + 
                      parseDet(obj, html, count) + "</div>";
      //hidden hide details button
      HTMLelements += "<button id=\"bl" + count + 
                      "\" onclick=\"toggleDetails(this.id)\" > Hide Details </button>";

      HTMLelements += parseImg(obj, html, count);
    

      html.innerHTML += "<div class=\"container\">" + HTMLelements + "</div>";

      $("#more" + count).hide();
      $("#bl" + count).hide();

      count++;
    }
    $("#numresult").text("Your search produced " + 
                    count + " results: ");
  }
}
//parseimage deals with when a specific result is an image file
function parseImg(obj, html, count)
{
  //set max width to 200px while keeping aspect ratio
  var string = "";
  string += "<img src=\"" + obj.links[0].href + "\" class=\"imgresult\"> " + "<br />"; 
  return string;
}

//parseDet deals with the optional detail display
function parseDet(obj, html, count)
{
  var string = "";

  //only display YYYY/MM/DD for date
  var date = obj.data[0].date_created
  if(date.length > 10) 
  {
    date = date.substring(0,10);
  }
  string += "<h6> Date Created: " + date + "</h6>";

  //media type
  //string += "<h6> Media Type: " + obj.data[0].media_type + "</h6>";

  //tags that link to a new search
  string += "<h6> Tags: </h6>";
  var j;
  if(obj.data[0].keywords != null)
  {
    for(j = 0; j < obj.data[0].keywords.length; j++)
    {
      var tag = obj.data[0].keywords[j];
      string += "<button class=\"tag\" onclick=\"search(\'" + 
                tag + "\', \'\', \'\', \'\', \'\', \'\'); textboxtag(\'" + tag + "\'); \">" + tag + " </button>";
      //string += "<button class=\"tag\" onclick=\"search(\'" + tag + "\'); \">" + tag + " </button>";
    }
  }
  //string += "</h6>"


  //description
  string += "<h6> Description: " + obj.data[0].description + "</h6>";

  //if applicable, photographer
  if(obj.data[0].photographer != null)
  {
    string += "<h6> Photographer: " + obj.data[0].photographer + "</h6>";
  }

  //if applicable, location
  if(obj.data[0].location != null)
  {
    string += "<h6> Location: " + obj.data[0].location + "</h6>";
  }

  //nasa id
  string += "<h6> NasaID: " + obj.data[0].nasa_id + "</h6>";

  //add anymore metadata here:

  return string;
}

//toggledetails hides or shows details for specific container
function toggleDetails(id)
{
  count = id.substring(2, id.length);
  $("#more" + count).toggle();
  $("#bl" + count).toggle();
  $("#bm" + count).toggle();
}

//clearfilters removes all the current filters
function clearfilters()
{
  $("#add_startdate").val("");
  $("#add_enddate").val("");
  $("#add_location").val("");
  $("#add_photographer").val("");
  $("#add_location").val("");
  $("#add_nasaid").val("");
}
