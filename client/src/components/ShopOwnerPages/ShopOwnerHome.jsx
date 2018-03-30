import React, { Component } from "react";
import OnlineMarketplaceContract from "../../contracts/OnlineMarketplace.json";
import getWeb3 from "../../utils/getWeb3";
import { Row, Col, Grid, Table, Button, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import swal from 'sweetalert';


class ShopOwnerHome extends Component {
    state = { 
        storageValue: 0, 
        web3: null, 
        accounts: null, 
        contract: null, 
        storeName: "",
        tableData: "",
        displayTable: false,
        storeNames: "",
        pageone: true,
        pagetwo: false,
        productName: "",
        productPrice: "",
        productQuantity: "",
        selectedStore: "",
        selectedStoreName: "",
        storeProducts: "",
        displayProductsTable: false,
        productsList: ""
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
            this.getStoreList();
        }
        else {
            this.props.history.push('/');
        }
        
    }

    getStoreList = async() => {
        const { contract, accounts } = this.state;
        const data = await contract.methods.getOwnerStoreList().call({ from: accounts[0] });
        var storeNamesData = [];
        for(var i = 0; i < data.length; i++){
            var storeData = await contract.methods.getStoreById(data[i]).call({ from: accounts[0] });
            storeNamesData[i] = storeData[0];
        }
        this.setState({
            tableData: data,
            displayTable: true,
            storeNames: storeNamesData
        });
    }

    getProductsList = async() => {
        const { contract, accounts, selectedStore } = this.state;
        const data = await contract.methods.getProductsByStore(selectedStore).call({ from: accounts[0] });
        var productsData = [];
        for(var i = 0; i < data.length; i++){
            var pData = await contract.methods.getProductById(data[i]).call({ from: accounts[0] });
            if(pData[0].length > 0) {
                productsData.push(pData);
            }
        }
        this.setState({
            displayProductsTable: true,
            productsList: productsData
        });
    }

    changeProductPrice = async(code) => {
        const { contract, accounts } = this.state;
        swal({
            text: 'Enter New Price',
            content: "input",
            button: {
              text: "Save",
              closeModal: false,
            },
          })
          .then( async(price) => {
            if (!price) throw null;
            var response = await contract.methods.changePrice(code, price).send({ from: accounts[0] });

            if(response.status === true) {
                swal({
                    title: "Success",
                    text: "Price Changed",
                    icon: "success"
                });

            }
            
          });
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    manageStore = async(id) => {
        const { contract, accounts } = this.state;
        var storeData = await contract.methods.getStoreById(id).call({ from: accounts[0] });
        this.setState({
            pageone: false,
            pagetwo: true,
            selectedStore: id,
            selectedStoreName: storeData[0]
        }, this.getProductsList);
    }

    createProductsTable(data) {
        let table = []
        for (let i = 0; i < data.length; i++) {
            let children = []
            children.push(<td key={i + 1}>{i + 1}</td>) 
            children.push(<td key={i + 2}>{data[i][0]}</td>) 
            children.push(<td key={i + 3}>{data[i][1]}</td>) 
            children.push(<td key={i + 4}>{data[i][2]}</td>) 
            children.push(<td key={i + 5}><Button bsStyle="primary" onClick={ () => this.changeProductPrice(data[i][3])} block>Change Price</Button>   <Button bsStyle="danger" onClick={ () => this.deleteProduct(data[i][3])} block>Delete</Button></td>) 
            table.push(<tr key={i}>{children}</tr>)
        }
        return table;
    }

    createTable = (data, names) => {
        var mainData = data;
        let table = []
        for (let i = 0; i < mainData.length; i++) {
            let children = []
            children.push(<td key={i + 1}>{i + 1}</td>) 
            children.push(<td key={i + 2}>{names[i]}</td>) 
            children.push(<td key={i + 3}><Button bsStyle="primary" onClick={ () => this.manageStore(mainData[i])} block>Manage</Button></td>) 
            table.push(<tr key={i}>{children}</tr>)
        }
        return table;
    }



    addStore = async () => {
        const { accounts, contract } = this.state;
        var response = await contract.methods.addStore(this.state.storeName).send({ from: accounts[0] });

        if(response.status === true) {
            swal({
                title: "Success",
                text: "Store Added",
                icon: "success"
            });

            this.setState({
                storeName: ""
            }, this.getStoreList);
        }
    }

    addProduct = async () => {
        const { accounts, contract, selectedStore, productName, productPrice, productQuantity } = this.state;
        var response = await contract.methods.addProduct(selectedStore, productName, productQuantity, productPrice).send({ from: accounts[0] });

        if(response.status === true) {
            swal({
                title: "Success",
                text: "Product Added",
                icon: "success"
            });

            this.setState({
                storeName: ""
            }, this.getProductsList);
        }
    };

    deleteProduct = async (product) => {
        const { accounts, contract } = this.state;
        var response = await contract.methods.deleteProduct(product).send({ from: accounts[0] });

        if(response.status === true) {
            swal({
                title: "Success",
                text: "Product Removed",
                icon: "success"
            }).then(() => {
                this.getProductsList();
            });
        }
    };

  getValidationState() {
    const length = this.state.ownerAddress.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
    return null;
  }

  getStoreBalance = async() => {
    const { accounts, contract } = this.state;
    const data = await contract.methods.getStoreBalance(this.state.selectedStore).call({ from: accounts[0] });
    swal({
        title: "" + data + " wei",
        text: "You have " + data + " wei to withdraw"
    });
  }

  withdrawBalance = async() => {
    const { accounts, contract } = this.state;
  
    const response = await contract.methods.withdrawFunds(this.state.selectedStore).send({ from: accounts[0] });
    if(response.status === true) {
        swal({
            title: "Success",
            text: "Balance Withdrawed",
            icon: "success"
        });
    }
  }

  goBack = () => {
      this.setState({
        pageone: true,
        pagetwo: false,
        selectedStore: "",
        selectedStoreName: ""
      });
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
                <Col md={12}>
                    <h3>Manage Stores</h3>
                </Col>
            </Row>
            <Row className="displayRow">

                <Col md={6}>
                    <h4>Add Store</h4>
                    <hr/>
                    <form>
                        <FormGroup
                            controlId="storeName"
                        >
                        <ControlLabel>Enter Store Name</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.storeName}
                            placeholder="Enter Store Name"
                            onChange={this.handleChange}
                        />
                        </FormGroup>

                        <Button bsStyle="success" onClick={this.addStore} block>Add Store</Button>
                    </form>
                </Col>

                <Col md={6}>
                    <h4>List Of Stores</h4>
                    <Table>
                        <thead>
                            <tr>
                                <td>No.</td>
                                <td>Name</td>
                                <td>Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.displayTable ?
                                this.createTable(this.state.tableData, this.state.storeNames)
                            :
                            null}
                        </tbody>
                    </Table>
                </Col>
                
            </Row>    
        </Grid>     
        :
        <Grid>
            <Row>
                <Col md={6}>
                    <h3>Manage Products for { this.state.selectedStoreName }</h3>
                </Col>
                <Col md={2}>
                    <br/>
                    <Button bsStyle="info" onClick={this.getStoreBalance} block>Sales Balance</Button>
                </Col>
                <Col md={2}>
                    <br/>
                    <Button bsStyle="success" onClick={this.withdrawBalance} block>Withdraw</Button>
                </Col>
                <Col md={2}>
                    <br/>
                    <Button bsStyle="warning" onClick={this.goBack} block>Back</Button>
                </Col>
            </Row>
            <Row className="displayRow">

                <Col md={6}>
                    <h4>Add Product</h4>
                    <hr/>
                    <form>
                        <FormGroup
                            controlId="productName"
                        >
                            <ControlLabel>Product Name</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.state.productName}
                                placeholder="Product Name"
                                onChange={this.handleChange}
                            />
                        </FormGroup>

                        <FormGroup
                            controlId="productPrice"
                        >
                            <ControlLabel>Product Price</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.state.productPrice}
                                placeholder="Product Price"
                                onChange={this.handleChange}
                            />
                        </FormGroup>
                        <FormGroup
                            controlId="productQuantity"
                        >
                            <ControlLabel>Product Quantity</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.state.productQuantity}
                                placeholder="Product Quantity"
                                onChange={this.handleChange}
                            />
                        </FormGroup>
                        <Button bsStyle="success" onClick={this.addProduct} block>Add Product</Button>
                    </form>
                </Col>

                <Col md={6}>
                    <h4>List Of Products</h4>
        
                    <hr/>
                    <Table>
                        <thead>
                            <tr>
                                <td>No.</td>
                                <td>Product Name</td>
                                <td>Quantity</td>
                                <td>Price</td>
                                <td>Action</td>
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

export default ShopOwnerHome;
