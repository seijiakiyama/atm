import config from '../config';

export function generateStatement(data) {
  return config.database.create('Statement', data);
}

export function updateStatement(statement, value) {
  return config.database.update(
    'Statement',
    { _id: statement['_id'] },
    { $set: {newBalance: value} }
  );
}

export function upsert(collection, op) {
  return config.database.update(collection, op.where, op.op, {upsert: true});
}

export function bulkOp(collection, bulkOp) {
  return config.database.bulkOp(collection, bulkOp);
}

export function getAllowedBanknotes(banknotes) {
  return config.database.find('Banknote',
    { notAllowed: {'$ne': true} })
    .then((results) => {
      results = results.map((note) => {
        return note.value;
      });
      if (Array.isArray(banknotes)) {
        console.log(results, banknotes)
        return banknotes.every((banknote) => {
          return results.includes(banknote);
        });
      } else {
        return results;
      }
    });
}

export function withdrawBanknotes(data) {
  let bulkOp = data.banknotes.map((banknote) => {
    return { updateOne: {
      filter: { value: banknote.value },
      update: {'$inc': { amount: banknote.amount }},
      upsert: true
    }};
  });
}

export function checkAvailableBalance(account, value) {
  return config.database.find('Account',
    { account: account })
    .then((results) => {
      if (value > 0 && Array.isArray(results) && results[0]) {
        return value <= results[0].balance;
      } else if (value === undefined) {
        return results[0].balance;
      } else {
        throw new Error('Invalid account');
      }
    });
}

export function getAvailableNotes() {
  return config.database.find('Banknote', {});
}
