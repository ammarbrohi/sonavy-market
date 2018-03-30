import React, { Component } from "react";
import OnlineMarketplaceContract from "../../contracts/OnlineMarketplace.json";
import getWeb3 from "../../utils/getWeb3";
import { Row, Col, Grid, Button, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
import swal from 'sweetalert';


class AdminHome extends Component {
  state = { 
      storageValue: 0, 
      web3: null, 
      accounts: null, 
      contract: null, 
      ownerAddress: "",
      address_remove: "",
      admin_address: "",
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
        this.props.history.push('/admin')
    }
    else if(data == 2){
        this.props.history.push('/shopowner')
    }
    else {
        this.props.history.push('/')
    }

  }

  addStoreOwner = async () => {
    const { accounts, contract } = this.state;
    var response = await contract.methods.addShopOwner(this.state.ownerAddress).send({ from: accounts[0] });
    // const response = await contract.methods.get().call();
    if(response.status === true) {
        swal({
            title: "Success",
            text: "Store Owner Added",
            icon: "success"
        });
    }
  };

  removeStoreOwner = async () => {
    const { accounts, contract } = this.state;
    var response = await contract.methods.removeShopOwner(this.state.address_remove).send({ from: accounts[0] });
    if(response.status === true) {
        swal({
            title: "Success",
            text: "Store Owner Removed. Store Balance has been Transferred to Owner's Account",
            icon: "success"
        });
    }
  };

  handleChange = event => {
    this.setState({
        [event.target.id]: event.target.value
    });
  }

  getBalance = async() => {
    const { accounts, contract } = this.state;
    const data = await contract.methods.getContractBalance().call({ from: accounts[0] });
    swal({
        title: "" + data + " wei",
        text: "The contract has " + data + " wei."
    });
  }

  getValidationState() {
    const length = this.state.ownerAddress.length;
    if (length > 10) return 'success';
    else if (length > 5) return 'warning';
    else if (length > 0) return 'error';
    return null;
  }


  render() {
    if (!this.state.web3) {
      return <div className="message">Loading Web3. Please <b>Refresh Page</b> if it takes a while.</div>;
    }
    return (
      <div>
        <div className="message">Administrator Mode</div>;
        <Grid>
            <Row>
                <Col md={10}>
                    <h3>Manage Store Owners</h3>
                </Col>
                <Col md={2}>
                    <br/>
                    <Button bsStyle="info" onClick={this.getBalance} block>Get Contract Balance</Button>
                </Col>
            </Row>
           
            <Row className="displayRow">

                <Col md={6}>
                    <h4>Add Store Owner</h4>
                    <hr/>
                    <form>
                        <FormGroup
                            controlId="ownerAddress"
                        >
                        <ControlLabel>Enter New Store Owner Address</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.ownerAddress}
                            placeholder="Enter Address"
                            onChange={this.handleChange}
                        />
                        </FormGroup>

                        <Button bsStyle="success" onClick={this.addStoreOwner} block>Add Owner</Button>
                    </form>
                </Col>

                <Col md={6}>
                    <h4>Remove Store Owner</h4>
                    <hr/>
                    <form>
                        <FormGroup
                            controlId="address_remove"
                        >
                        <ControlLabel>Enter Owner Address</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.address_remove}
                            placeholder="Enter Address"
                            onChange={this.handleChange}
                        />
                        </FormGroup>

                        <Button bsStyle="danger" onClick={this.removeStoreOwner} block>Remove Owner</Button>
                    </form>
                </Col>
                
            </Row>   
        </Grid>     
     
      </div>
    );
  }
}

export default AdminHome;
