import * as request from 'request';
import * as config from './config';

export let Request = function(url ? : any) {
  return new Promise((resolve, reject) => {
    request(url ? url: config.mainUrl, (error, response, html) => {
      resolve(html);
    });
  });
};
