const ethers  = require('ethers');
const express = require('express');
const pdflib  = require('pdf-lib');
var fs        = require('fs');
var os        = require('os');
var request   = require('request');

var config    = require('./config.json');

const app = express();
const port = 3000; //FIXME

const privateKey = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; //FIXME
const wallet     = new ethers.Wallet(privateKey);
const valueInETH = "0.001"; //FIXME
const gasLimit   = "53000"; //FIXME
//const provider   = ethers.getDefaultProvider('rinkeby');    
const provider   = new ethers.providers.JsonRpcProvider();// Default: http://localhost:8545 //FIXME

app.get('/generatepdf/:addressto', async function( _req , _res ){
    const addressto = _req.params.addressto;
    console.log('/generatepdf/' + addressto )    
    const filePath = await generatePDFwithMetaData(addressto);
    
    fs.readFile(filePath, function(err, data) {
        _res.writeHead(200, {'Content-Type': 'application/pdf'});
        _res.write(data);
        _res.end();
    }); 
});

async function generatePDFwithMetaData(_addressto) {
  const pdfDoc = await pdflib.PDFDocument.create()
  const timesRomanFont = await pdfDoc.embedFont(pdflib.StandardFonts.TimesRoman)
  
  const page = pdfDoc.addPage([500, 600])
  page.setFont(timesRomanFont)
  page.drawText('Declaração', { x: 60, y: 500, size: 25 })
  page.drawText('Dono é ' + _addressto, { x: 60, y: 460, size: 15 })
  
  // Note that these fields are visible in the "Document Properties" section of 
  // most PDF readers.
  pdfDoc.setTitle('Declaração de uso do BNDESToken')
  pdfDoc.setAuthor('BNDES')
  pdfDoc.setSubject('Definir direitos e deveres do usuário do BNDESToken')
  pdfDoc.setKeywords(['bndestoken', 'bndes', 'blockchain', 'token', 'dlt'])
  pdfDoc.setProducer('')
  pdfDoc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)')
  pdfDoc.setCreationDate(new Date())
  pdfDoc.setModificationDate(new Date())
  
  const pdfBytes = await pdfDoc.save()

  const path = writePdfToTmp(pdfBytes);
  console.log(`> PDF file written to: ${path}`);
  return path;
}

function writePdfToTmp( _pdf ) {
  const path = `${os.tmpdir()}/${Date.now()}.pdf`;
  fs.writeFileSync(path, _pdf);
  return path;
};

app.get('/requestEth/:addressto',function( _req , _res ){
    const addressto = _req.params.addressto;
    console.log('/requestEth/' + addressto )
    const isValidAddress = testParam(addressto);
    
    if ( isValidAddress ) {
        requestETH( addressto );
    } else {
        console.log("Can not send ETH to an invalid address!")
    }        

    _res.send("The address: " + addressto + " | is valid? " + isValidAddress);    
    _res.end();    
});

app.get('/loginunico',function( _req , _res ){
    var response_type = "code";
    var client_id = "token-h.bndes.gov.br";
    var redirect_uri = "https%3A%2F%2Ftoken-h.bndes.gov.br";
    var scope  = "openid+email+phone+profile";
    var nonce = Math.round ( Math.random()*100000 ) ;
    //var state = "";

    var url = "https://sso.staging.acesso.gov.br/authorize?"
                  + "response_type="     + response_type
                  + "&client_id="        + client_id 
                  + "&scope="            + scope 
                  // + "&redirect_uri="     + redirect_uri 
                  // + "&nonce="            + nonce  
                  // + "&state="            + state 

    _res.redirect(url);

});

//app.get('/loginunico/autorizado/:code/:state',function( _req , _res ){
app.get('/loginunico/autorizado/:code',function( _req , _res ){
    const code  = _req.params.code;
    //const state = _req.params.state;
    console.log('/loginunico/autorizado/' + code )
    //console.log('/loginunico/autorizado/' + state )
    
    //_res.send("Response: " + code + " | " + state);    
    console.log("Code: " + code );    

    var redirect_uri = "https%3A%2F%2Ftoken-h.bndes.gov.br";
    var url = "https://sso.staging.acesso.gov.br/token?" +
              "grant_type=authorization_code" + 
              "&code=" + code + 
              "&redirect_uri=" + redirect_uri;

    //acessar via POST o https://sso.staging.acesso.gov.br/token com o code

    console.log("URL : " + url);
    let data = config.CLIENT_ID + ":" + config.CLIENT_SECRET;
    let buff = Buffer.from(data);
    let base64data = buff.toString('base64');

    console.log( data )
    console.log( base64data );
    console.log();

    request.post({ headers: 
                    { 
                      'Authorization' : 'Basic ' + base64data
                    }, 
                    url: url, 
                 }, function(error, response, body){
                        console.log(error);
                        console.log();
                        //console.log(response);
                        //console.log();
                        console.log(body); 
                    });
                });

function requestETH( _addressto ) {    
    var gasPricePromise         = provider.getGasPrice();
    var balancePromise          = provider.getBalance(wallet.address);    
    var transactionCountPromise = provider.getTransactionCount(wallet.address);

    var allPromises = Promise.all([
        gasPricePromise,
        balancePromise,
        transactionCountPromise
    ]);

    var sendPromise = allPromises.then(
        function(results) {    
            var gasPrice         = results[0];
            var balance          = results[1];
            var transactionCount = results[2];
           
            var value = ethers.utils.parseEther(valueInETH);

            var transaction = {
                to: _addressto,
                gasPrice: gasPrice,
                gasLimit: ethers.utils.bigNumberify(gasLimit),
                nonce: transactionCount,

                // The amount to send
                value: value,

                // Prevent replay attacks across networks
                chainId: provider.chainId,
            };

            var signedTransaction = wallet.sign(transaction);

            // By returning a Promise, the sendPromise will resolve once the
            // transaction is sent
            console.log("The transaction promise was made."); 
            console.log("The current balance is " + balance);             
            return provider.sendTransaction(signedTransaction);
        }
    );

    // This will be called once the transaction is sent
    sendPromise.then(
        function(transaction) {        
            // This promise will be resolve once the transaction has been mined.
            console.log("The transaction was sent: " + transaction.hash); 
        } 
    );

    sendPromise.catch(
        function(error) {
            console.log("An error happened!");
            console.log(error);
        }
    );

}

function testParam( _param ) {
    try {
        ethers.utils.getAddress( _param );
        return true;
    } catch(e) {
        return false;
    }
}

app.listen(port, () => console.log('App listening on port ' + port + '!'))