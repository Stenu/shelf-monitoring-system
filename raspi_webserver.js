/*
 * Raspberry Pi - Hyllynseurantaj�rjestelm�
 * Internet Of Things - kurssin harjoitusprojekti
 * Sami Stenvall
 */




var http = require('http'); //require http server, and create server with function handler()
Canvas = require('/usr/lib/node_modules/canvas'); // require for canvas element 
var getPixels = require("/usr/lib/node_modules/get-pixels")  
var NodeWebcam = require( "node-webcam" ); // require for webcam usage

console.log('creating server');
http.createServer(handler).listen(8080); // listen to port 8080





// handler for webserver
function handler (req, res) { //create server

    // define variable for webcam options
    var opts = {
        width: 640,
        height: 480,
        quality: 50,
        delay: 0,  //Delay to take shot
        saveShots: true,  //Save shots in memory
        output: "jpeg",
        device: false, //false uses default webcam device 
        callbackReturn: "location",
        verbose: false     //Logging
    };

    var Webcam = NodeWebcam.create( opts ); // instantiate webcam object


    Webcam.capture( "kuva", function( err, data ) { // first asynchronous part takes photo with webcam
        if(err){ console.log(err);}

        getPixels("kuva.jpg", function(err, pixels) { // second asynchronous part takes pixels from photo and puts them to ndarray
            if (err) {console.log(err);}



          var img = new Canvas.Image; // Create a new Image
          img.src = data; //put taken photo to image

          // Initialiaze a new Canvas with the same dimensions
          // as the image, and get a 2D drawing context for it.
          var canvas = new Canvas(img.width, img.height);
          var ctx = canvas.getContext('2d');

          // return if image is not viable (otherwise server crashes)
          try{
               ctx.drawImage(img, 0, 0, img.width , img.height );
             } 
          catch(err){
                return;
             }

          // draw line number to canvas
          ctx.font = '30px Impact';
          ctx.fillText("Rivi 1", 170, 120);
          ctx.fillText("Rivi 2", 170, 220);
          ctx.fillText("Rivi 3", 170, 320);




        // check line1
        var rivi1 = 0;
        rivi1 += onkoKappale(310,98,pixels,ctx);
        rivi1 += onkoKappale(350,100,pixels,ctx);
        rivi1 += onkoKappale(390,102,pixels,ctx);
        rivi1 += onkoKappale(425,105,pixels,ctx);
        rivi1 += onkoKappale(460,110,pixels,ctx);
        rivi1 += onkoKappale(490,115,pixels,ctx);
        rivi1 += onkoKappale(520,120,pixels,ctx);

        // check line2
        var rivi2 = 0;
        rivi2 += onkoKappale(300,205,pixels,ctx);
        rivi2 += onkoKappale(340,205,pixels,ctx);
        rivi2 += onkoKappale(380,205,pixels,ctx);
        rivi2 += onkoKappale(420,210,pixels,ctx);
        rivi2 += onkoKappale(450,210,pixels,ctx);
        rivi2 += onkoKappale(485,210,pixels,ctx);
        rivi2 += onkoKappale(520,210,pixels,ctx);

        // check line3
        var rivi3 = 0;
        rivi3 += onkoKappale(300,297,pixels,ctx);
        rivi3 += onkoKappale(340,295,pixels,ctx);
        rivi3 += onkoKappale(375,295,pixels,ctx);
        rivi3 += onkoKappale(410,295,pixels,ctx);
        rivi3 += onkoKappale(445,295,pixels,ctx);
        rivi3 += onkoKappale(480,295,pixels,ctx);
        rivi3 += onkoKappale(520,295,pixels,ctx);


        // write html page that is sent as response 
        res.write('<html>\n<head>\n<meta http-equiv="refresh" content="1" charset="utf-8" />\n');
        res.write('<style>\n');
        res.write('body {\n  background-color: #347B98;\n  padding: 50px;\n  }\n');
        res.write('div {\n background-color: #0247FE;\n  margin: auto;\n  width: 800px;\n  text-align: center;\n    border-radius: 25px;\n  border-style: solid;\n}');
        res.write('img {border-radius: 5px;\n  border-style: solid;\n}\n');
        res.write('p {\n  font-color: #110934;\n  font-size: 30px;\n  margin: auto;\n    margin-top: 10px;\n  border-radius: 5px;\n  border-style: solid;\n  margin-bottom: 10px;\n  color: black;\n  padding-top: 10px;\n   padding-bottom: 10px;\n background-color: #D4EDF7;\n  width: 640px;}\n');
        res.write('</style>\n');
        res.write('</head>\n');
        res.write('<body>\n');
        res.write('<div>\n');
        res.write('<p>Raspberry Pi - hyllynseurantajärjestelmä</p>\n');
        res.write('<img src="' + canvas.toDataURL() + '" /><br>\n');
        res.write('<p> Rivillä 1  kappaleita on '+rivi1+' kpl <br>');
        res.write('Rivillä 2 kappaleita on '+rivi2+' kpl <br>');
        res.write('Rivillä 3 kappaleita on '+rivi3+' kpl </p>\n');
        res.write('</div>\n');
        res.write('</body>\n</html>');
        res.end();

        });

    });
}

// function that checks if there is white piece on 10x10 area of pixels
function onkoKappale (x, y, pixels, ctx){

    // skip if we are too close to edge 
    if(x-5 < 0 || y-5 < 0){
        return 0;
    }
    
    if(pixels === undefined){
      return 0;
    }

    // move to corner of 10x10 area
    x -= 5;
    y -= 5;



    var colorMeanValue = 0;
      for(i = 0; i<10; i++){
        for(j = 0; j<10; j++){
            
            //this calculates mean from RGB values
            //var apu = parseInt( pixels.get(x+i,y+j,0) );
            //apu += parseInt ( pixels.get(x+i,y+j,1) );
            //apu = parseInt( pixels.get(x+i,y+j,2)) ;
            //colorMeanValue += parseInt(apu/3);
            
            // this takes only value of blue pixels (seems to work best)
            colorMeanValue += parseInt( pixels.get(x+i,y+j,2));
        }
      }
      
      colorMeanValue = colorMeanValue/100; // divide by 10x10 to get mean

      // is area black or white?
      if(colorMeanValue < 160){
        ctx.fillStyle = 'red';
        ctx.fillRect(x,y,10,10);
        return 0;
      } else {
        ctx.fillStyle = 'green';
        ctx.fillRect(x,y,10,10);
        return 1;
      }

}
