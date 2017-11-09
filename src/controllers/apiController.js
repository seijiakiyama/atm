import * as databaseController from './databaseController';

export function deposit(data) {
  if (checkData(data)) {
    return checkAllowedBanknotes(data.banknotes)
      .then((allowed) => {
        //console.log(allowed)
        if (allowed) {
          let bulkOp = data.banknotes.map((banknote) => {
            return { updateOne: {
              filter: { value: banknote.value },
              update: {'$inc': { amount: banknote.amount }},
              upsert: true
            }};
          });
          ////////////////////////////////
          return databaseController.generateStatement(data)
            .then((statement) => {
              //console.log(statement)
              return databaseController
                .bulkOp('Banknote', bulkOp)
                .then(() => {
                  return databaseController.upsert('Account', {
                    where: { account: data.targetAccount },
                    op: {'$inc': { balance: Number(data.value) }}
                  });
                }).then((updatedAccount) => {
                  let value = updatedAccount.balance;
                  return databaseController.updateStatement(statement, value);
                }).then((statement) => {
                  data.deposited = true;
                  data.statement = statement._id;
                  return data;
                });
            });
        } else {
          throw new Error('Banknote not allowed');
        }
      });
  } else {
    return Promise.reject(new Error('Invalid deposit'));
  }

  function checkData(data) {
    return !Number.isNaN(Number(data.value)) &&
      Array.isArray(data.banknotes) &&
      data.targetAccount &&
      Number(data.value) === (data.banknotes.reduce((sum, note) => {
        return sum + (note.amount || 0) * (Number(note.value) || 0);
      }, 0));
  }
}

export function withdraw(data){
  // checks if sent data is valid
  if (checkData(data)) {
    // checks if account has available balance
    return databaseController.checkAvailableBalance(data.account, data.value)
      .then((goodToGo) => {
        if (goodToGo) {
          // generates statement
          return databaseController.generateStatement(data)
            .then((statement) => {
              // calculates and removes banknotes
              return withdrawBanknotes(data.value)
                .then((results) => {
                  // removes value from account balance
                  data.banknotes = results;
                  return databaseController.upsert('Account', {
                    where: { account: data.account },
                    op: {'$inc': { balance: -1 * Number(data.value) }}
                  });
                }).then((updatedAccount) => {
                  let value = updatedAccount.balance;
                  return databaseController.updateStatement(statement, value);
                }).then(() => {
                  data.success = true;
                  return data;
                }).catch((e) => {
                  console.log(e.stack);
                  //rollback
                  //save statement without returning promise
                  throw e;
                });
            })
        } else {
          throw new Error('Insuficient balance');
        }
      });
  } else {
    return Promise.reject(new Error('Invalid withdraw'));
  }

  function checkData(data) {
    return !Number.isNaN(Number(data.value)) &&
      data.account;
  }
}

export function checkAllowedBanknotes(banknotes) {
  if (Array.isArray(banknotes)) {
    let parsedBanknotes = banknotes.map((banknote) => {
      return banknote.value;
    });
    return databaseController.getAllowedBanknotes(parsedBanknotes)
      // .then((results) => {
      //   if (Array.isArray(results)) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // });
  } else {
    return databaseController.getAllowedBanknotes();
  }
}

function withdrawBanknotes(value) {
  return databaseController
    .getAvailableNotes()
    .then((results) => {
      let noteValue = [];
      let amount = results.map((banknote) => {
        noteValue.push(banknote.value);
        return banknote.amount;
      });
      return getMinimumBanknotes(noteValue, amount, value);
    })
    .then((minimum) => {
      console.log('minimum', minimum);
      if (minimum) {
        let bulkOp = Object.keys(minimum).map((banknote) => {
          return { updateOne: {
            filter: { value: banknote },
            update: {'$inc': { amount: (-1 * minimum[banknote]) }},
            upsert: true
          }};
        });
        return databaseController.bulkOp('Banknote', bulkOp)
        .then(() => {
          return minimum;
        });
      } else {
        throw new Error('Insufficient banknotes or Invalid banknotes calculation');
      }
    });
}

function getMinimumBanknotes(notes, count, value) {
  console.log('notes', notes);
  console.log('count', count);
  console.log('value', value);
  // adapted from coin change problem
  let notesSize = notes.length; // different notes array
  let dp = new Array(value + 1); // different possibilities array
  let result = new Array(value + 1); // dp with notes array
  for (let i = 1; i <= value + 1; i++) {
    dp[i] = Number.MAX_VALUE;
  }
  dp[0] = 0;
  var sum = 0;
  for (var i = 0; i < notesSize; i++) {
    sum += notes[i] * count[i];
    for (var j = notes[i]; j <= sum && j <= value; j++) {
      if(dp[j] > dp[j - notes[i]] + 1) {
        dp[j] = dp[j - notes[i]] + 1;
        result[j] = Object.assign(result[j] || {}, result[j-notes[i]] || {});
        result[j][notes[i]] =
          (result[j-notes[i]] ? result[j-notes[i]][notes[i]] || 0 : 0 ) + 1;
      }
    }
  }
  let finalResult = result[value];
  // final check
  if (finalResult) {
    for (var i = 0; i < notesSize; i++) {
      if (count[i] < finalResult[notes[i]])
        return false;
    }
    return finalResult;
  } else {
    return false;
  }
}
