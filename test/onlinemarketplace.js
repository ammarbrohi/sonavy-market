var OnlineMarketplace = artifacts.require("OnlineMarketplace");

contract("OnlineMarketplace", function(accounts) {

    const admin = accounts[0];
    const shopowner = accounts[1];
    const shopper = accounts[2];
    
    /*
        Testing if an admin is able to add a shop owner. Also tests if correct type of user is returned based on the address type.
        As per the checkUserType should return 1 if user is admin and 2 if user is a shop owner. It will return 3 for shopper.
        The purpose of having this test is to ensure that store owners are added successfully with the appropiate user type.
    */
    it("should add a shop owner", async() => {
        var Marketplace = await OnlineMarketplace.deployed();

        await Marketplace.addShopOwner(accounts[1], {from: accounts[0]});
        var userType = await Marketplace.checkUserType({from: accounts[1]});

        assert.equal(userType, 2, 'the user type should be 2 for shop owner');

    });

    /*
        Testing if a shop owner is able to add a store front. Only shop owners should be able to call this function.
        The purpose of this test is to ensure that a store owner is able to add a new store front. This is a important feature to test.
    */
    it("should add a new store front", async() => {
        var Marketplace = await OnlineMarketplace.deployed();

        await Marketplace.addStore("Awesome Store", {from: accounts[1]}); 
        var store = await Marketplace.getStoreById(0, {from: accounts[1]}); //0 will be the id for this store as it is the first one.

        assert.equal(store[0], "Awesome Store", 'the correct store should be returned');

    });

    /*
        Testing if a shop owner is able to add a product to the created store front. Only shop owners should be able to call this function.
        The purpose of this test is to ensure that a shop owner is able to add a product to a store front that they created earlier. 
        This is an important feature to test.
    */
    it("should add a new product", async() => {
        var Marketplace = await OnlineMarketplace.deployed();

        await Marketplace.addProduct(0, "Fiji Water", 10, 10000, {from: accounts[1]}); 
        var product = await Marketplace.getProductById(0, {from: accounts[1]});

        assert.equal(product[0], "Fiji Water", 'the correct product should be returned');

    });

    /*
        Testing if a shopper is able to buy a product. The quantity should decrease and contract balance should increase.
        The purpose of this test is to check if consumers will be able to buy a product. This test is important as it checks that when a sale is made, balance and quantity is changed correctly.
    */
    it("should be able to buy a product", async() => {
        var Marketplace = await OnlineMarketplace.deployed();

        await Marketplace.buyProduct(0, {from: accounts[2], value: 10000}); 
        var product = await Marketplace.getProductById(0, {from: accounts[1]});
        var balance = await Marketplace.getContractBalance({from: accounts[0]});

        assert.equal(product[1].c[0], 9, 'the quantity should decrease by 1');
        assert.equal(balance, 10000, 'the balance should increase by 10000');
    });

    /*
        Testing if a shop owner is able to withdraw funds. The contract balance should decrease.
        The purpose of this test is to check if a store owner is able to withdraw funds. This is an important feature to test to ensure correct funds are withdrawed by store owners.
    */
    it("should be able to withdraw balance from a store", async() => {
        var Marketplace = await OnlineMarketplace.deployed();

        await Marketplace.withdrawFunds(0, {from: accounts[1]}); 
        var balance = await Marketplace.getContractBalance({from: accounts[0]});

        assert.equal(balance, 0, 'the balance should decrease by 10000');
    });

});