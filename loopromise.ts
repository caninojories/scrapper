export class LooPromise {
  constructor() {
  }

  init(condition, action) {
    return new Promise<any>((resolve, reject) => {
      let loop = _ => {
        if (!condition()) {
          return resolve();
        }

        return action()
          .then(loop)
          .catch(reject);
      };

      process.nextTick(loop);
    });
  }
}
