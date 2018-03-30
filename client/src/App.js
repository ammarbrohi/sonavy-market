/*
  Sonavy Market
  Name: Ammar Hassan
  Email: brohiammar@gmail.com
*/


import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import ShopperHome from "./components/ShopperPages/ShopperHome";
import AdminHome from "./components/AdminPages/AdminHome";
import ShopOwnerHome from "./components/ShopOwnerPages/ShopOwnerHome";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };


  render() {
    return (
      <div>
          <div id="header">
              <h2>Online Marketplace</h2>
          </div> 
          <BrowserRouter>
              <div>
                  <Route exact path="/" component={ShopperHome} />
                  <Route exact path="/admin" component={AdminHome} />
                  <Route exact path="/shopowner" component={ShopOwnerHome} />
              </div>
          </BrowserRouter>
      </div>
    );
  }
}

export default App;
