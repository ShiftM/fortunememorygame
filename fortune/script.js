function addStars (data, level) {

    userStars = parseInt( userStars) +  parseInt(data);
    // localStorage.setItem("userStars", userStars);

    setTimeout(function(){ 
    // var temp = localStorage.getItem("playerLevel");
    //   userProgress = JSON.parse("[" + temp + "]");
      // SAVE PROGRESS
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "/saveProgress", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
    //   xhttp.setRequestHeader('Authorization', 'bearer ' + token);
      xhttp.send('{"userId":"'+ContactId+'","userProgress":"'+userProgress+'","userStars":"'+userStars+'","level":"'+parseInt(level+1)+'", "points":"'+parseInt(data)+'"}');
      xhttp.onload = function (message) {
          console.log(message)
          window.parent.postMessage("refreshBalance", "*")
      }
      xhttp.onerror = function (error) {
          console.log(error.message)
      }
    }, 2000);
  }


  function getUserProgress () {
    return userProgress;
  }