import * as config from './config';

import {
  Request
} from './request';
import {
  Cheerio
} from './cheerio';

export class Server {
  constructor(private _rootUrl: any) {
    console.log('Running the Program...');
  }

  start() {
    return new Promise((resolve, reject) => {
      Request()
      .then(response => {
         return Cheerio(response, this._rootUrl);
      })
      .then(() => {
        resolve();
      });
    });
  }
}
