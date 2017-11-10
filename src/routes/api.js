import express from 'express';
import * as apiController from '../controllers/apiController'

const router = express.Router();

router.get('/balance', function(req, res, next) {
  apiController.balance(req.query.account)
    .then(successBalance)
    .catch((e) => {
      res.status(400).send('Value not deposited: ' + e);
    });

  function successBalance(result) {
    if (result) {
      res.status(200).json(result)
    } else {
      throw new Error('Value not deposited. Unknown Error.');
    }
  }
});

router.post('/deposit', function(req, res, next) {
  let parsedInput = parseInput(req);
  apiController.deposit(parsedInput)
    .then(successDeposit)
    .catch((e) => {
      res.status(400).send('Value not deposited: ' + e);
    });

  function successDeposit(result) {
    if (result.deposited) {
      res.status(201).json({
        value: result.value,
        banknotes: result.banknotes
      })
    } else {
      throw new Error('Value not deposited. Unknown Error.');
    }
  }
});

router.post('/withdraw', function(req, res, next) {
  let parsedInput = parseInput(req);
  apiController.withdraw(parsedInput)
    .then(successWithdraw)
    .catch((e) => {
      res.status(400).send('Value not deposited: ' + e);
    });

  function successWithdraw(result) {
    if (result.success) {
      res.status(200).json({
        value: result.value,
        banknotes: result.banknotes
      })
    } else {
      throw new Error('Value not deposited. Unknown Error.');
    }
  }
});

function parseInput(req) {
  // TODO validate
  return req.body;
}

export default router;
