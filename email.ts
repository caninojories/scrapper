'use strict';
import * as nodemailer from 'nodemailer';
import * as Events from 'events';
let check = 1;
let fileName = null;
let events = new Events.EventEmitter();
let smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
      user: 'steves.scrapper@gmail.com',
      pass: 'Steve123'
    }
});

export let sendMail = function SendMail(filename) {
  fileName = filename;
  smtpTransport.sendMail(inputmail(),function(err,success){
    if(err){
        events.emit('error', err);
    }
    if(success){
        events.emit('success', success);
    }
  });
}

function inputmail(){
  const from = 'steves.scrapper@gmail.com';
  const to  = 'steve.mcclanahan@gmail.com, caninojories@gmail.com';
  const subject  = 'SCRAPPER';
  const text = '';
  const html = '';
  var mailOption = {
    from: from,
    to:  to,
    subject: subject,
    text: text,
    html: html,
    attachments: [{
      filename: fileName,
      path: fileName // stream this file
    }]
  }

  return mailOption;
}


events.on('error', function(error) {
  console.log('Mail not send');
  if (check < 10) {
    sendMail(fileName);
  } else {
    process.exit();
  }

  check++;
});

events.on('success', function(success) {
  console.log('Mail send');
  process.exit();
});
