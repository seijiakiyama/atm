# atm
NodeJS Test with basic deposit/withdraw-minimum

Live URL:  
https://intense-dawn-27185.herokuapp.com/  

API:  

* `/api/balance` [GET]  
```
?account=<account-id>
```  

* `/api/deposit` [POST]
```
{
  "value": 5,
  "banknotes": [
    {
      "value": "2",
      "amount": 2
    },
    {
      "value": "1",
      "amount": 1
    }
  ],
  "targetAccount": "test"
}
```  

* `/api/withdraw` [POST]
```
{
  "value": 1,
  "account": "test"
}
```
