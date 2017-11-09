import express from 'express';
import * as apiController from '../controllers/apiController'

const router = express.Router();

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

function parseInput(req) {
  return req.body;
}

export default router;
