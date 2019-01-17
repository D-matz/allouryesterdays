var key = "RGAPI-f0766717-fd9d-4c01-9ebb-fbffd993cf6d";
var tmi = require('tmi.js'); //what does this do? I don't know. Ask this guy https://www.youtube.com/watch?v=K6N9dSMb7sM
const https = require('https');
var shell = require('shelljs'); //to run curl. this might not be necessary if I knew what I was doing or the internet was helpful
var robot = require("robotjs"); //actually amazing this exists, lets the program move mouse/type keys as if you were doing it yourself

var pidToWatch = ['1','2','3','4,','5','q','w','e','r','t']; //remember pick order ty DrCyanide (NA)
var leftOfTime = 509; //quality scaleable code to determine where to put the cursor on the timeline
var rightOfTime = 1013;

function quitGame() //hits escape clicks exit then exit again
{
  console.log("quitting");
  robot.keyToggle("command","down");
  robot.keyToggle("alt","down");
  robot.keyToggle("escape","down");
  setTimeout(function()
  {
    robot.keyToggle("command","up");
    robot.keyToggle("alt","up");
    robot.keyToggle("escape","up");
    console.log("quit");
  }, 300);
}

function resolveN(seconds) { //seems glitchy sometmes, but actually waits for n seconds (unlike the rest of the confusing stuff on the internet)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000*seconds);
  });
}

async function watchDeaths(times, follow) {
  console.log(follow);
  var lengthOfTime = rightOfTime-leftOfTime;
  shell.exec('./watch.sh'); //starts downloading/watching the game
  /*while(true)
  {
      var mouse = robot.getMousePos();
      console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y);
      var result = await resolveN(2);
  }*/ //a highly scientific way of determining certain coordinates, akin to machine learning *except with humans and not learning
  var result = await resolveN(45);
  var screenSize = robot.getScreenSize();
  var height = screenSize.height;
  var width = screenSize.width;
  console.log("follow "+follow);
  robot.typeString(follow);
  robot.keyTap("enter");
  for(var i=0;i<times.length;i++)
  {
    var result = await resolveN(20);
    var screenSize = robot.getScreenSize();
    robot.moveMouse(leftOfTime+lengthOfTime*times[i],height*.95);
    robot.mouseToggle("down");
    setTimeout(function()
    {
        robot.mouseToggle("up");
    }, 2000);
    console.log(times[i]);
  }
  quitGame();
}

var allChamps = new Array(600);

https.get('https://gist.githubusercontent.com/supergrecko/3364e58ed436feda656edcccc6ef7e75/raw/c283c33f696eba5085e9906904212fa635303436/champion.json', (resp) => { //very short -grecko
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    var list = JSON.parse(data);
    for(var i=0;i<=141;i++)
    {
      var obj = list[i];
      var key = obj.key;
      if(key !== undefined)
      {
        allChamps[parseInt(key)] = JSON.stringify(obj.name);
      }
    }
    console.log("got champs");
  });
}).on("error", (err) => {
  console.log("failed to get champions");
});


var options = {
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    username: "todustydeath",
    password: "oauth:n58lgu47pt7izw5t3bv0po7l91h4sp" //lets the bot log in to own channel
  },
  channels: ["allouryesterdays"] //channel for bot to to lurk in
}

var client = new tmi.client(options);
client.connect(); //some twitch bot stuff idk

var inspiration = ["I wish it need not have happened in my time, said Frodo. So do I, said Gandalf, and so do all who live to see such times. But that is not for them to decide. All we have to decide is what to do with the time that is given us.","Old Tom Bombadil is a merry fellow, Bright blue his jacket is, and his boots are yellow. None has ever caught him yet, for Tom, he is the master: His songs are stronger songs, and his feet are faster.","https://www.youtube.com/watch?v=_fuIMye31Gw","This was the very reason why you were brought to Narnia, that by knowing me here for a little, you may know me better there.","Now, I should very much like to have it explained to me what kind of misery there can be for a free being, whose heart is at peace, and body in health.","Go placidly amid the noise and haste, and remember what peace there may be in silence.","There is nothing noble in being superior to your fellow man; true nobility is being superior to your former self."," A high ambition, an elevated courage, is apt, says Cicero, in less perfect characters, to degenerate into a turbulent ferocity.", "Dejection subjects a man to causeless fears, which is a madness commonly called MELANCHOLY","I wish there was a way to know you're in the good old days before you've actually left them","https://www.youtube.com/watch?v=KBh7kcSwxbg","How lucky I am to have something that makes saying goodbye so hard","And when my prayers to God were met with indifference, I picked up a pen, I wrote my own deliverance","He’d always felt he had a right to exist as a wizard in the same way that you couldn’t do proper maths without the number 0, which wasn’t a number at all but, if it went away, would leave a lot of larger numbers looking bloody stupid.","Gotta have opposites, light and dark and dark and light, in painting. It’s like in life. Gotta have a little sadness once in awhile so you know when the good times come","https://www.youtube.com/watch?v=XfR9iY5y94s","never send to know for whom the bells tolls; it tolls for thee","Should you be allowed to sell your own kidney?","All food is ethnic food."];

client.on('chat', function(channel, user, message, self) {
  var lower = message.toLowerCase();
  if(lower == "!gandalf")
  {
    client.action("allouryesterdays", "https://www.youtube.com/watch?v=zGbZCgHQ9m8");
  }
  else if(lower == "!riot")
  {
    client.action("allouryesterdays", "Allouryesterdays isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.");
  }
  else if(lower == "!perspective")
  {
    var random = Math.floor(Math.random()*26);
    if(random<22)
    {
      client.action("allouryesterdays", inspiration[random]);
    }
    else if(random == 21)
    {
      client.action("allouryesterdays", "I know how to save the company, everyone.");
      client.action("allouryesterdays", " Just write a petition, ");
      client.action("allouryesterdays", "get everyone's signature,");
      client.action("allouryesterdays", "including our clients,");
      client.action("allouryesterdays", "march down to Florida,");
      client.action("allouryesterdays", "and shove it up your butt!");
    }
    else if(random == 23)
    {
      client.action("allouryesterdays", "THE SUN WOULD NOT HAVE RISEN.");
      client.action("allouryesterdays", "Really? Then what would have happened, pray?");
      client.action("allouryesterdays", "A MERE BALL OF FLAMING GAS WOULD HAVE ILLUMINATED THE WORLD.");
      client.action("allouryesterdays", "They walked in silence for a moment.");
      client.action("allouryesterdays", "Ah, said Susan dully. Trickery with words. I would have thought youd have been more literal-minded than that.");
      client.action("allouryesterdays", "I AM NOTHING IF NOT LITERAL-MINDED. TRICKERY WITH WORDS IS WHERE HUMANS LIVE.");
      client.action("allouryesterdays", "All right, said Susan. I'm not stupid. Youre saying humans need fantasies to make life bearable.");
      client.action("allouryesterdays", "REALLY? AS IF IT WAS SOME KIND OF PINK PILL? NO. HUMANS NEED FANTASY TO BE HUMAN. TO BE THE PLACE WHERE THE FALLING ANGEL MEETS THE RISING APE.");
    }
    else if(random == 24)
    {
      client.action("allouryesterdays", "After lying there about three quarters of an hour, I nerved myself up again, and started on my way, through bogs and briers, barefooted and bareheaded, tearing my feet sometimes at nearly every step; and after a journey of about seven miles, occupying some five hours to perform it, I arrived at master's store...From the crown of my head to my feet, I was covered with blood. My hair was all clotted with dust and blood; my shirt was stiff with blood...");
      client.action("allouryesterdays", "He would then walk the floor, and seek to justify Covey by saying he expected I deserved it.");
    }
    else if(random == 25)
    {
      client.action("allouryesterdays", "1. take a bite of steak");
      client.action("allouryesterdays", "2. wash it down with some whiskey, preferably single malt scotch");
      client.action("allouryesterdays", "3. find a socialist, and punch him or her in the face");
      client.action("allouryesterdays", "4. handcraft a small wooden boat, out of cedar preferably, obviously");
      client.action("allouryesterdays", "5. and finally make love to a partner of your choice, preferably someone accepting of your advances, and upon climax withdraw your firearm and unload some rounds laced with double entendre into the night sky");
      client.action("allouryesterdays", "That's what everyone thinks I'm going to say, but what I would really say is just stand up for your principles and be loyal to your friends and family.");
    }
    else if(random == 22)
    {
        client.action("allouryesterdays", "Why did the chicken cross the road?");
        client.action("allouryesterdays", "It had been crossing so long it could not remember. As it stopped in the middle to look back, a car sped by, spinning it around. Disoriented, the chicken realized it could no longer tell which way it was going. It stands there still.");
    }
    else if(random == 19)
    {
      client.action("allouryesterdays", "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives.");
      client.action("allouryesterdays", "The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization, every king and peasant, every young couple in love, every mother and father, hopeful child, inventor and explorer, every teacher of morals, every corrupt politician, every \"superstar,\" every \"supreme leader,\" every saint and sinner in the history of our species lived there");
      client.action("allouryesterdays", "on a mote of dust suspended in a sunbeam");
    }
    else if (random == 20) {
        client.action("allouryesterdays", "I met a traveller from an antique land, Who said—“Two vast and trunkless legs of stone");
        client.action("allouryesterdays", "Stand in the desert. . . . Near them, on the sand, Half sunk a shattered visage lies, whose frown,");
        client.action("allouryesterdays", "And wrinkled lip, and sneer of cold command, Tell that its sculptor well those passions read");
        client.action("allouryesterdays", "Which yet survive, stamped on these lifeless things, The hand that mocked them, and the heart that fed;");
        client.action("allouryesterdays", "And on the pedestal, these words appear: My name is Ozymandias, King of Kings;");
        client.action("allouryesterdays", "Look on my Works, ye Mighty, and despair!");
        client.action("allouryesterdays", "Nothing beside remains. Round the decay");
        client.action("allouryesterdays", "Of that colossal Wreck, boundless and bare The lone and level sands stretch far away.");
    }
  }
  else if(lower.substring(0,6) == "!death")
  {
    var name;
    var region;
    var game;
    var str = lower.substring(6);
    if(str.charAt(0) == 's')
    {
      str = str.substring(1);
    }
    if(str.charAt(0) == ' ')
    {
      str = str.substring(1);
    }
  //  console.log(str);
    var end = str.indexOf('/');
    name = str.substring(0,end);
    str = str.substring(end+1);
    end = str.indexOf('/');
    if(end<0)
    {
      region = str;
      game = 1;
    }
    else
    {
      region = str.substring(0,end);
      str = str.substring(end+1);
      game = parseInt(str);
    }
    if(region=="na"||region=="north america"||region=="northamerica")
    {
      region = "NA1"
    }
    else if(region=="euw")
    {
      region = "EUW1"
    }
    else if(region=="eun")
    {
      region = "EUN1"
    }
    else if(region=="br")
    {
      region = "BR1"
    }
    else if(region=="oce")
    {
      region = "OCE1"
    }
    else if(region=="jp")
    {
      region = "JP1"
    }
    else if(region=="tr")
    {
      region = "TR1"
    }
    else if(region=="la"||region=="lan")
    {
      region = "la2"
    }
    //get the account v
    https.get("https://"+region+".api.riotgames.com/lol/summoner/v4/summoners/by-name/"+name+"?api_key="+key, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        var accId = JSON.parse(data).accountId;
        if(accId == undefined)
        {
          client.action("allouryesterdays", "Usage: !death scarra/na or !death scarra/na/7");
        }
        else if(game<1)
        {
          client.action("allouryesterdays", "1 or more games ago, can't input <1");
        }
        else
        {
          //get the matchlist v
          https.get("https://"+region+".api.riotgames.com/lol/match/v4/matchlists/by-account/"+accId+"?queue=420&endIndex="+game+"&beginIndex="+(game-1)+"&api_key="+key, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
              data += chunk;
            });
            resp.on('end', () => {
              var deathTimers = [];
              var mortal = false;
              var gameId = JSON.parse(data).matches[0].gameId;
              var plural = "games";
              if(game == 1)
              {
                plural = "game";
              }
              //get the deaths v
              https.get("https://na1.api.riotgames.com/lol/match/v4/matches/"+gameId+"?api_key="+key, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                  data += chunk;
                });
                resp.on('end', () => {
                  var pid = 0;
                  var champions = ["a","b","c","d","e","f","g","next","time","wont"];
                  var kills = "error";
                  var deaths = "error";
                  var assist = "error";
                  var win = " (loss) ";
                  var duration = parseInt(JSON.parse(data).gameDuration)*1000;
                  for(var i=0;i<10;i++)
                  {
                    champions[i] = allChamps[parseInt(JSON.parse(data).participants[i].championId)];
                    var player = JSON.parse(data).participantIdentities[i].player.accountId;
                  //  console.log(player+" vs "+accId);
                    if(player == accId)
                    {
                      pid = i+1;
                      var stats = JSON.parse(data).participants[i].stats;
                      kills = stats.kills;
                      deaths = stats.deaths
                      assists = stats.assists;
                      console.log(stats.win);
                      if(JSON.stringify(stats.win)=="true")
                      {
                        win = " (win) "
                      }
                    }
                  }
                  var playerChamp = champions[parseInt(pid-1)];
                  client.action("allouryesterdays", JSON.parse(playerChamp)+win+kills+"/"+deaths+"/"+assists);
                  console.log("pid: "+pid);
                  https.get("https://na1.api.riotgames.com/lol/match/v4/timelines/by-match/"+gameId+"?api_key="+key, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => {
                      data += chunk;
                    });
                    resp.on('end', () => {
                      var frames = JSON.parse(data).frames;
                      var frame = frames[0];
                      var i = 0;
                      while(frame !== undefined)
                      {
                        var events = frame.events;
                        var event = events[0];
                        var j = 0;
                        while(event !== undefined)
                        {
                          if(event.type == "CHAMPION_KILL" && event.victimId == pid)
                          {
                            mortal = true;
                            var killerChamp = champions[parseInt(event.killerId)-1]; //get a bunch of stats to put while waiting for video to load
                            var assists = event.assistingParticipantIds;
                            var assisters = "";
                            var dieAlone = 0;
                            for(var n=0;n<4;n++)
                            {
                              if(assists[n] !== undefined)
                              {
                                assisters = JSON.parse(champions[parseInt(assists[n])-1])+", "+assisters;
                                dieAlone++;
                              }
                            }
                            assisters = assisters.substring(0,assisters.length-2);
                            if(dieAlone == 0)
                            {
                              assisters = "";
                            }
                            else if(dieAlone > 1)
                            {
                              assisters = " (assists: "+assisters+")";
                            }
                            else
                            {
                                assisters = " (assist: "+assisters+")";
                            }
                            var time = event.timestamp;
                            deathTimers.push((time-13000)/duration);
                      //      console.log("watch death at: "+(time/1000)/60+" at "+event.position.x+","+event.position.y);
                            var sec = Math.floor(time/1000)%60;
                            if(sec<10)
                            {
                              sec = "0"+sec;
                            }
                            var min = Math.floor(time/60000)%60;
                            var hour = Math.floor(time/3600000)%24; // >league games lasting an hour in 2019 LuL
                            if(hour==0)
                            {
                              hour = "";
                            }
                            else
                            {
                              hour = hour+":";
                            }
                            client.action("allouryesterdays", JSON.parse(killerChamp)+" killed "+JSON.parse(playerChamp)+" at "+hour+min+":"+sec+assisters);
                          }
                          j++;
                          event = events[j];
                        }
                        i++;
                        frame = frames[i];
                      }
                      if(!mortal)
                      {
                        client.action("allouryesterdays", "What do we say to the god of death?");
                        client.action("allouryesterdays", "Not today");
                      }
                      else
                      {
                        process.env.LOLGAMEID = gameId; //gives gameid to curl command
                        console.log(pid+" "+pidToWatch[pid-1]);
                        watchDeaths(deathTimers, pidToWatch[pid-1]); //starts downloading/watching/jumping around replay
                      }
                    });
                  }).on("error", (err) => {
                  //  console.log("Error: " + err.message);
                  });
                });
              }).on("error", (err) => {
              //  console.log("Error: " + err.message);
              });
              //get the deaths ^
            });
          }).on("error", (err) => {
          //  console.log("Error: " + err.message);
            client.action("allouryesterdays", "Usage: !death scarra/na or !death scarra/na/7");
          });
          //get the matchlist ^
        }
      });
    }).on("error", (err) => {
    //  console.log("Error: " + err.message);
      client.action("allouryesterdays", "Usage: !death scarra/na or !death scarra/na/7");
    });
  }
});

/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣧⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣧⠀⠀⠀⢰⡿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡟⡆⠀⠀⣿⡇⢻⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⣿⠀⢰⣿⡇⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡄⢸⠀⢸⣿⡇⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⡇⢸⡄⠸⣿⡇⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⢸⡅⠀⣿⢠⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣥⣾⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⡿⡿⣿⣿⡿⡅⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠉⠀⠉⡙⢔⠛⣟⢋⠦⢵⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣄⠀⠀⠁⣿⣯⡥⠃⠀⢳⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⡇⠀⠀⠀⠐⠠⠊⢀⠀⢸⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⡿⠀⠀⠀⠀⠀⠈⠁⠀⠀⠘⣿⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣷⡀⠀⠀⠀
⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣿⣧⠀⠀
⠀⠀⠀⡜⣭⠤⢍⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⢛⢭⣗⠀
⠀⠀⠀⠁⠈⠀⠀⣀⠝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠠⠀⠀⠰⡅
⠀⠀⠀⢀⠀⠀⡀⠡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠔⠠⡕⠀
⠀⠀⠀⠀⣿⣷⣶⠒⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀⠀
⠀⠀⠀⠀⠘⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⢿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠊⠉⢆⠀⠀⠀⠀
⠀⢀⠤⠀⠀⢤⣤⣽⣿⣿⣦⣀⢀⡠⢤⡤⠄⠀⠒⠀⠁⠀⠀⠀⢘⠔⠀⠀⠀⠀
⠀⠀⠀⡐⠈⠁⠈⠛⣛⠿⠟⠑⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠉⠑⠒⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
*/
