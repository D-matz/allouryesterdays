var key = "KEY";
var tmi = require('tmi.js'); //what does this do? I don't know. Ask this guy https://www.youtube.com/watch?v=K6N9dSMb7sM
const https = require('https');
var shell = require('shelljs'); //to run curl. this might not be necessary if I knew what I was doing or the internet was helpful
var robot = require("robotjs"); //actually amazing this exists, lets the program move mouse/type keys as if you were doing it yourself
const fs = require('fs') //check if file exists

var leftOfTime = 509; //quality scaleable code to determine where to put the cursor on the timeline
var rightOfTime = 1013;
var minX = 1220;
var minY = 681;
var maxX = 1430;
var maxY = 887;

var nameQueue = []; //to manage multiple requests
var regionQueue = [];
var gameQueue = [];
var userQueue = []; //maybe no spammers
var inGame = false;

function parse(name,region,game)
{
  //  console.log(str);
  /*  var end = str.indexOf('/');
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
    }*/
    //console.log(game+" "+region+" "+name);
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
          client.action("allouryesterdays", "Usage: !death scarra or !death scarra/7");
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
              if(JSON.parse(data).matches!==undefined)
              {
                gameId = JSON.parse(data).matches[0].gameId;
                var fileContents = [];
                var fileName = "./cache/"+gameId+accId;
                inGame = true;
                if (fs.existsSync(fileName))
                {
                    console.log(fileName+" in cache");
                    fs.readFile(fileName, 'utf8', function(err, data) {
                        if (err) throw err;
                        var nextComma = data.indexOf(",");
                        var stuff = [];
                        while(nextComma>0)
                        {
                          stuff.push(data.substring(0,nextComma));
                          data = data.substring(nextComma+1);
                          nextComma = data.indexOf(",");
                        }
                        var duration = stuff.shift();
                        var kills = stuff.shift();
                        var deaths = stuff.shift();
                        var assists = stuff.shift();
                        var win = stuff.shift();
                        var playerChamp = stuff.shift();
                        client.action("allouryesterdays", JSON.parse(playerChamp)+win+kills+"/"+deaths+"/"+assists);
                        var deathsX = [];
                        var deathsY = [];
                        deathTimers.push(0); //for some reason it skips the first death sometimes idk
                        deathsX.push(7500);
                        deathsY.push(7500);
                        var length = stuff.length;
                        var champsInvolved = [];
                        for(var s=0;s<length;s++)
                        {
                          if(parseInt(stuff[s])-1+1==stuff[s])
                          {
                            console.log(s+" is number");
                            var time = stuff[s];
                            deathTimers.push((time-10000)/duration);
                            deathsX.push(stuff[s+1]);
                            deathsY.push(stuff[s+2]);
                            s = s+2;
                            var champs = champsInvolved.length;
                            var assisters = "";
                            if(champs == 1)
                            {
                              assisters = " (assist: ";
                            }
                            else if (champs > 1)
                            {
                              assisters = " (assists: ";
                            }
                            for(var c=0;c<champs-1;c++)
                            {
                              assisters = assisters+JSON.parse(champsInvolved[c])+", "; //make assisters the proper (assist(s):...)
                            }
                            assisters = assisters.substring(0,assisters.length-2);
                            printDeath(time,playerChamp,champsInvolved[champs-1],assisters+")");
                            champsInvolved = [];
                          }
                          else
                          {
                            champsInvolved.push(stuff[s]);
                            console.log("push "+stuff[s]+" length "+champsInvolved.length);
                          }
                        }
                        if(deathTimers.length>2)
                        {
                          process.env.LOLGAMEID = gameId; //gives gameid to curl command
                          watchDeaths(deathTimers, deathsX, deathsY); //starts downloading/watching/jumping around replay
                          deathsX = [];
                          deathsY = [];
                        }
                        else
                        {
                          client.action("allouryesterdays", "What do we say to the god of death?");
                          client.action("allouryesterdays", "Not today");
                        }
                    });
                }
                else
                {
                  console.log(fileName+" not in cache");
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
                      fileContents.push(duration);
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
                          if(JSON.stringify(stats.win)=="true")
                          {
                            win = " (win) "
                          }
                          fileContents.push(kills);
                          fileContents.push(deaths);
                          fileContents.push(assists);
                          fileContents.push(win);
                        }
                      }
                      var deathsX = [];
                      var deathsY = [];
                      deathTimers.push(0); //for some reason it skips the first death sometimes idk
                      deathsX.push(7500);
                      deathsY.push(7500);
                      var playerChamp = champions[parseInt(pid-1)];
                      fileContents.push(playerChamp);
                      console.log("playing "+playerChamp+" game "+gameId);
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
                            var j = 0;
                        //    console.log("on "+i);
                            while(events[j] !== undefined)
                            {
                          //    console.log(" on "+j);
                              var event = events[j];
                              if(event.type == "CHAMPION_KILL" && event.victimId == pid)
                              {
                                mortal = true;
                                var number = parseInt(event.killerId)-1;
                                var killerChamp = "error";
                                if(number == -1)
                                {
                                  killerChamp = "Execute";
                                }
                                else
                                {
                                  killerChamp = JSON.parse(champions[number]);
                                }
                                //get a bunch of stats to put while waiting for video to load
                                var assists = event.assistingParticipantIds;
                                var assisters = "";
                                var dieAlone = 0;
                                for(var n=0;n<4;n++)
                                {
                                  if(assists[n] !== undefined)
                                  {
                                    var assistChamp = champions[parseInt(assists[n])-1];
                                    fileContents.push(assistChamp);
                                    assisters = JSON.parse(assistChamp)+", "+assisters;
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
                                deathTimers.push((time-10000)/duration);
                                deathsX.push(event.position.x);
                                deathsY.push(event.position.y);
                                printDeath(time,playerChamp,killerChamp,assisters);
                                fileContents.push(killerChamp);
                                fileContents.push(time);
                                fileContents.push(event.position.x);
                                fileContents.push(event.position.y);
                              }
                              j++;
                              event = events[j];
                            }
                            i++;
                            frame = frames[i];
                          }
                          var gameInfo = "";
                          var info = fileContents.length;
                          for(var add=0;add<info;add++)
                          {
                            gameInfo = gameInfo + fileContents[add]+",";
                          }
                          fs.writeFile(fileName, gameInfo, function(err) {
                            if(err) {
                              return console.log(err);
                            }
                            console.log("saved "+fileName);
                          });
                          if(!mortal)
                          {
                            client.action("allouryesterdays", "What do we say to the god of death?");
                            client.action("allouryesterdays", "Not today");
                          }
                          else
                          {
                            process.env.LOLGAMEID = gameId; //gives gameid to curl command
                            watchDeaths(deathTimers, deathsX, deathsY); //starts downloading/watching/jumping around replay
                            deathsX = [];
                            deathsY = [];
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
                }
              }
              else
              {
                client.action("allouryesterdays", "Usage: !death scarra or !death scarra/7 maybe you mistyped the name");
              }
            });
          }).on("error", (err) => {
          //  console.log("Error: " + err.message);
            client.action("allouryesterdays", "Usage: !death scarra or !death scarra/7");
          });
          //get the matchlist ^
        }
      });
    }).on("error", (err) => {
    //  console.log("Error: " + err.message);
      client.action("allouryesterdays", "Usage: !death scarra or !death scarra/7");
    });
}

function quitGame()
{
  shell.exec('./kill.sh');
  inGame = false;
  if(userQueue.length>0)
  {
    client.action("allouryesterdays", "on "+userQueue.shift());
    parse(nameQueue.shift(),regionQueue.shift(),gameQueue.shift());
  }
}

function resolveN(seconds) { //seems glitchy sometmes, but actually waits for n seconds (unlike the rest of the confusing stuff on the internet)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000*seconds);
  });
}

var replayReg = "NA1"; //na client only works on na? :D: D :D
var gameId = "-1";

//var startGame = ['160c07','160c05','160b05','160a05','160c05','170b06','170d06','170d05'];
var screenSize = robot.getScreenSize();
var height = screenSize.height;
var width = screenSize.width;
var lenX = maxX-minX;
var lenY = maxY-minY;
var lengthOfTime = rightOfTime-leftOfTime;
async function watchDeaths(times, xpos, ypos) {
  shell.exec('./download.sh');
  const path = '/Users/david/documents/League of Legends/Replays/'+replayReg+"-"+gameId+".rofl";
  var downloaded = false;
  while(!downloaded)
  {
    try {
      if (fs.existsSync(path)) {
        console.log("file exists, time to watch game")
        downloaded = true;
        shell.exec('./watch.sh'); //starts downloading/watching the game, "./" breaks windows
        /*while(true)
        {
            var mouse = robot.getMousePos();
            console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y);
            var result = await resolveN(2);
        }*. //a highly scientific way of determining certain coordinates, akin to machine learning *except with humans and not learning
      /*  for(var i=0;i<4;i++)
        {
          var portrait = robot.screen.capture(26+12, 12+132+86*i, 10, 10);
          console.log(portrait.image);
        }*/ //get the person by champ portrait?
        var mouse = robot.getMousePos();
        var hex = robot.getPixelColor(width/2, 5);
        while(hex!="9c7f43")
        {
          var result = await resolveN(1);
          hex = robot.getPixelColor(width/2, 5);
          console.log(hex);
        }
        for(var i=0;i<times.length;i++)
        {
          console.log(times[i]+": "+xpos[i]+","+ypos[i]);
          robot.moveMouse(leftOfTime+lengthOfTime*times[i],height*.95);
          robot.mouseToggle("down");
          setTimeout(function()
          {
              robot.mouseToggle("up");

          }, 2000);
          var waitabit = await resolveN(3);
          var robotX = minX+lenX*xpos[i]/15000;
          var robotY = minY+lenY*(1-ypos[i]/15000);
          robot.moveMouse(robotX,robotY);
          console.log(robot.getMousePos().x+","+robot.getMousePos().y);
          robot.mouseToggle("down");
          if(i>0)
          {
            var trythis = await resolveN(12);
          }
          robot.mouseToggle("up");
        }
        quitGame();
      }
    } catch(err) {
      console.error(err)
    }
    var lolmoedyingtokrackodyingandcrying = await resolveN(1); //wait until file downloaded to watch
  }
}

function printDeath(time, playerChamp, killerChamp, assisters)
{
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
  client.action("allouryesterdays", killerChamp+" killed "+JSON.parse(playerChamp)+" at "+hour+min+":"+sec+assisters);
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
    password: "OAUTH" //lets the bot log in to own channel
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
  else if(lower == "!queue")
  {
    var len = userQueue.length;
    for(var i=0;i<len;i++)
    {
      client.action("allouryesterdays", (i+1)+": "+userQueue[i]);
    }
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
    var region = "NA1"; //xD na client is na only? maybe?
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
    var end = str.indexOf('/');
    if(end<0)
    {
      name = str;
      game = 1;
    }
    else
    {
      name = str.substring(0,end);
      str = str.substring(end+1);
      game = parseInt(str);
    }
    if(game!=game) //useful trick from professor kindlemann; he clearly thought his class would be entirely useless, but I showed him!
    {
      client.action("allouryesterdays", "Usage: !death scarra or !death scarra/7");
    }
    else
    {
      var username = user.username;
      var canStart = false;
      var len = userQueue.length;
      if(len>0) //actually this might be redundant because if the length>0 you're basically in game?
      {
        var inQ = false;
        for(var c=0;c<len;c++)
        {
          if(userQueue[c] == username)
          {
            client.action("allouryesterdays", username+" is already in line");
            c = len;
            inQ = true
          }
        }
        if(!inQ)
        {
          nameQueue.push(name); //4 separate arrays very elegant xd
          regionQueue.push(region);
          gameQueue.push(game);
          userQueue.push(username);
        }
      }
      else if(inGame)
      {
        nameQueue.push(name); //4 separate arrays very elegant xd
        regionQueue.push(region);
        gameQueue.push(game);
        userQueue.push(username);
        client.action("allouryesterdays", "game ongoing; "+username+" added to queue");
      }
      else
      {
        canStart = true;
      }
      if(canStart)
      {
          parse(name,region,game);
      }
    }
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
