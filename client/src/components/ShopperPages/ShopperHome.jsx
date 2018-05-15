import React, { Component } from "react";
import OnlineMarketplaceContract from "../../contracts/OnlineMarketplace.json";
import getWeb3 from "../../utils/getWeb3";
import { Row, Col, Grid, Button, Table, Label } from "react-bootstrap";
import swal from 'sweetalert';


class ShopperHome extends Component {
  state = { 
    storageValue: 0, 
    web3: null, 
    accounts: null, 
    contract: null,
    displayStoresTable: false,
    storesList: "",
    pageone: true,
    pagetwo: false,
    openedStore: "",
    openedStoreName: "",
    productsList: "",
    displayProductsTable: false
  };

  componentDidMount = async () => {
    try {

      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = OnlineMarketplaceContract.networks[networkId];
      const instance = new web3.eth.Contract(
        OnlineMarketplaceContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.checkUserType);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  checkUserType = async () => {
    const { contract, accounts } = this.state;
    const data = await contract.methods.checkUserType().call({ from: accounts[0] });

    if(data == 1){
        this.props.history.push('/admin');
    }
    else if(data == 2){
        this.props.history.push('/shopowner');
    }
    else {
        this.props.history.push('/');
        this.getStores();
    }
    
  }

  getStores = async() => {
    const { contract, accounts } = this.state;
      const data = await contract.methods.getStoreList().call({ from: accounts[0] });
      var storeData = [];
      
      for(var i = 0; i < data.length; i++){
          var sData = await contract.methods.getStoreById(data[i]).call({ from: accounts[0] });
          if(sData[0].length > 0) {
            storeData.push(sData);
          }
      }

      this.setState({
          displayStoresTable: true,
          storesList: storeData
      });
  }

  createTable = (data) => {
    let table = []
    for (let i = 0; i < data.length; i++) {
        let children = []
        children.push(<td key={i + 1}>{data[i][0]}</td>) 
        children.push(<td key={i + 2}><Button bsStyle="primary" onClick={ () => this.openStore(data[i][1])} block>Visit Store</Button></td>) 
        table.push(<tr key={i}>{children}</tr>)
    }
    return table;
  }

  openStore = async(value) => {
    const { contract, accounts } = this.state;
    var storeData = await contract.methods.getStoreById(value).call({ from: accounts[0] });
    var data = await contract.methods.getProductsByStore(value).call({ from: accounts[0] });

    var productsData = [];
    for(var i = 0; i < data.length; i++){
        var pData = await contract.methods.getProductById(data[i]).call({ from: accounts[0] });
        if(pData[0].length > 0 && pData[1] > 0) {
            productsData.push(pData);
        }
    }

    this.setState({
      openedStore: value,
      openedStoreName: storeData[0],
      pageone: false,
      pagetwo: true,
      productsList: productsData,
      displayProductsTable: true
    });
  }

  createProductsTable = (data) => {
    let table = []
    for (let i = 0; i < data.length; i++) {
        let children = []
        children.push(<td key={i + 1}>{data[i][0]}</td>) 
        children.push(<td key={i + 2}>{data[i][1]}</td>) 
        children.push(<td key={i + 3}>{data[i][2]}</td>) 
        children.push(<td key={i + 4}><Button bsStyle="success" onClick={ () => this.buyProduct(data[i][3], data[i][2])} block>Buy</Button></td>) 
        table.push(<tr key={i}>{children}</tr>)
    }
    return table;
  }

  buyProduct = async(data, price) => {
    const { accounts, contract } = this.state;
    var response = await contract.methods.buyProduct(data).send({ from: accounts[0], value: price });
    if(response.status === true) {
      swal({
          title: "Success",
          text: "Thank You for buying this product.",
          icon: "success"
      }).then(() => {
        this.openStore(this.state.openedStore);
      });
    }
  }

  browseStores = () => {
    this.setState({
      openedStore: "",
      openedStoreName: "",
      pageone: true,
      pagetwo: false,
      productsList: "",
      displayProductsTable: false
    }, this.getStores);
  }

  render() {
    if (!this.state.web3) {
      return <div className="message">Loading Web3. Please <b>Refresh Page</b> if it takes a while.</div>;
    }
    return (
      <div>
        {this.state.pageone ?
          <Grid>
              <Row>
                <Col md={4} className="aligncenter">
                    <br/>
                    <img src={require('../images/image1.png')} width="300px"/>
                </Col>
                <Col md={4} className="aligncenter">
                      <br/><br/><br/>
                      <h4>Welcome</h4>
                      <p>You will find a list of stores below. You can see the products that these stores offer and purchase it.</p>
                  </Col>
                  <Col md={4} className="aligncenter">
                      <br/>
                      <br/>
                      <br/>
                      <br/>
                      <h5><Label bsStyle="info">Account Being Used: {this.state.accounts[0]}</Label></h5>
                  </Col>
              </Row>
              <Row>
                  
                  
              </Row>

              <Row className="displayRow">
                <Col md={12}>
                  <hr/>
                  <Table >
                    <thead>
                      <tr>
                        <td>Store Name</td>
                        <td>See Products</td>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.displayStoresTable ?
                        this.createTable(this.state.storesList)
                      :
                        null
                      }
                    </tbody>                 
                  </Table>
                </Col>
              </Row>    
          </Grid>     
        :
          <Grid>
            <Row>
                <Col md={10}>
                    <h3>Products At {this.state.openedStoreName}</h3>
                </Col>
                <Col md={2}>
                    <br/>
                    <Button bsStyle="info" onClick={this.browseStores} block>Browse Other Stores</Button>
                </Col>
            </Row>
            <Row className="displayRow">
              <Col md={12}>
                <Table bordered hover>
                  <thead>
                    <tr>
                      <td>Product Name</td>
                      <td>Quantity</td>
                      <td>Price (Wei)</td>
                      <td>Buy</td>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.displayProductsTable ?
                      this.createProductsTable(this.state.productsList)
                    :null}
                  </tbody>                 
                </Table>
              </Col>
            </Row>    
          </Grid>     
        }
      </div>
    );
  }
}

export default ShopperHome;
