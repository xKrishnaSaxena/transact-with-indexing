# Order of the Day

- [x] init
- [x] setup db
- [x] signup
- [x] gen dep address
- [x] get dep address

# Advanced Orders

- [x] get the deposit address from the db
- [x] index the eth blocks for the transaction history of the deposit addresses
- [x] keep polling the blockchain for new blocks
- [x] update the balances ->

  - [x] approach 1
  - [x] straight up update the balances (not good)
  - [x] wait for 5 mins or smth and wait for events like forking or anything that takes places to happen if any
  - [x] get some checks regarding user , if he is valid and legal for the transactions
  - [x] after that update the balance (good)
  - [ ] approach 2 -> verify the transaction from various rpcs and then update

- [ ] private key management in db
