function dhtRead(pin,cb) {
  var d = "";
  var ht = this;
  pinMode(pin); // set pin state to automatic
  digitalWrite(pin, 0);
  var watch = setWatch(function(t) {
    d+=0|(t.time-t.lastTime>0.00005);
  }, pin, {edge:'falling',repeat:true} );
  setTimeout(function() {pinMode(pin,'input_pullup');},1);
  setTimeout(function() {
    clearWatch(watch);
    delete watch;
    var cks =
        parseInt(d.substr(2,8),2)+
        parseInt(d.substr(10,8),2)+
        parseInt(d.substr(18,8),2)+
        parseInt(d.substr(26,8),2);
    if (cks&&((cks&0xFF)==parseInt(d.substr(34,8),2))) {
      cb({
        raw : d,
        rh : parseInt(d.substr(2,8),2),
        temp : parseInt(d.substr(18,8),2)
      });
    }
  }, 50);
}

function onPageRequest(req, res) { 
    var a = url.parse(req.url, true);
    console.log(req);
    if(a.path == "/test") {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("This is a test");
        return;
    }

    if(a.path == "/temperature") {
        res.writeHead(200, {'Content-Type': 'application/json'});
        dhtRead(D14,
            function (a) {
                res.end('{ "temperature" : ' + a.temp.toString() + ', "humidity" :' + a.rh.toString()+'}');
            }
        );
        return;
    }
    
    if (a.path == "/relay1") {
        if(req.method=="GET") {
  
        } else if (req.method=="PUT") {
            digitalWrite(D4,0);   
        } else if (req.method=="DELETE") {
            digitalWrite(D4,1);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end("Not found");
            return;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{ "state" : ' + (digitalRead(D4) ^ 1) + "}"); 
        return;
    } 
    
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("Not found");
}

E.on('init', function() {
    var wifi=require("Wifi");
    wifi.setHostname("myesp");
    pinMode(D4,'opendrain_pullup');
    digitalWrite(D4,1);
    require("http").createServer(onPageRequest).listen(80);
});

save();




