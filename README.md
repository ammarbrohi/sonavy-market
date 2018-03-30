# Sonavy Market

## About

This project is market place created on truffle framework that allows shop owners to add store fronts. After store front they can add products which will be available for sale on their respective stores. They can perform CRUD operations on products. Project also has admin role that adds/removes shop owners.

Shop owner can perform tasks like change price of products etc.

Customers can visit store to browse products and purchase. Once they make purchase funds will be sent from shopper to smart contract. The shop owner can then widthraw from smart contract.



### Step 1

Run `npm install` in the project directory.

Change directory into *client*.

Run `npm install` in this directory.

### Step 2

Start Ganache [I have used GUI version 1.2.2]

### Step 3

Change directory into the project directory.

Run `truffle compile` in the project directory.  

If you're using Windows, use `truffle.cmd` instead of `truffle`.

### Step 4

Migrate your smart contract(s) onto your blockchain instance.

Run `truffle migrate --reset` in the project directory

### Step 5

Run `npm run start`. This will open the project in the browser on `localhost:3000`

### Step 6

Ganache Account 0 will be the admin account by default. Import this account in Metamask or `Reset Account` if it already existed.

### Step 7

Refresh Page. You will see Admin features if Metamask Account selection is for the Admin Address. Otherwise, you will see the shop owner page. 

### Step 8

Select Admin Account in Metamask and refresh page. You will see options to add/remove store owner. Copy and address from Ganache and add here. Import this account in Metamask as well. After you have added the address and changed account in Metamask. You can refresh the page to view Shop Owner Features. You can add stores, add/remove/edit products. You can also see current balance or withdraw funds.

### Step 9 

Import Another account in Metamask and refresh page. You will see shopper page. The user will be able to browse stores/ products and buy products on sale.