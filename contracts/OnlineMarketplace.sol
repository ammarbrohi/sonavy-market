pragma solidity 0.4.24;

//EthPM Packages
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/// @title   Sonavy Market
/// @author  Ammar Hassan <brohiammar@gmail.com>
/// @notice  This contract implements the backend for an online marketplace.
contract OnlineMarketplace is Ownable {

    using SafeMath for uint256; //To avoid integer underflow and overflows

    //For Circuit Breaker 
    bool public stopped = false;

    uint numStores;
    uint numProducts;

    uint[] storeArray;
    uint[] productArray;

    address fundsAddress;

    mapping (address => bool) public Admins;
    mapping (address => bool) public ShopOwner;

    /// @notice Initializes variables and makes contract creator the administrator
    constructor() public {
        Admins[msg.sender] = true;
        numStores = 0;
        numProducts = 0;
    } 

    /// @notice To save store related data
    struct Stores {
        address storeOwner;
        string storeName;
        uint balance;
    }

    /// @notice To save products related data
    struct Products {
        string name;
        uint quantity;
        uint price;
        uint store;
    }

    mapping (uint => Stores) public StoreFront;
    mapping (uint => Products) public ProductList;

    /// @notice Checks if sender is an administrator
    modifier onlyAdmin () { 
        require (Admins[msg.sender] == true, "Checks if sender is administrator"); 
        _;
    }

    /// @notice Checks if sender is a shop owner
    modifier onlyShopOwner () { 
        require (ShopOwner[msg.sender] == true, "Checks if sender is Shop Owner"); 
        _;
    }

    /// @notice Checks if stopped
    modifier stopInEmergency {
        require(!stopped, "Checks if stopped"); 
        _; 
    }

    /// @notice Checks if not stopped
    modifier onlyInEmergency { 
        require(stopped, "Checks if not stopped");
        _; 
    }

    /// @notice Check the type of user msg.sender is
    /// @return The user type. 1 is admin, 2 is shop owner and 3 is shopper
    function checkUserType() public view returns (uint) {
        if(Admins[msg.sender] == true) {
            return 1;
        }
        else if(ShopOwner[msg.sender] == true) {
            return 2;
        }
        else {
            return 3;
        }
    }

    /// @notice Adds a new shop owner. An admin can only call this function
    /// @param _newShopOwner is the address of the shop owner to be added
    function addShopOwner(address _newShopOwner) public onlyAdmin {
        require(Admins[_newShopOwner] == false, "Shop Owner cannot be an admin");
        ShopOwner[_newShopOwner] = true;
    }

    /// @notice Removes a shop owner. An admin can only call this function
    /// @param _ShopOwner is the address of the shop owner to be removed
    /// @dev First we get the number of stores and then iterate to transfer remaining balances and delete store fronts
    function removeShopOwner(address _ShopOwner) public payable onlyAdmin {
        ShopOwner[_ShopOwner] = false;
        uint count = 0;
        for(uint i = 0; i < storeArray.length; i++) {
            if(StoreFront[i].storeOwner == _ShopOwner ){
                count = count.add(1);
            }
        }

        uint amount = 0;
        for(uint j = 0; j < storeArray.length; j++) {
            if(StoreFront[j].storeOwner == _ShopOwner ){
                amount = StoreFront[j].balance;
                _ShopOwner.transfer(amount);
                StoreFront[j].balance = StoreFront[j].balance.sub(amount);
                delete StoreFront[j];
            }
        }
    }

    /// @notice Adds a new store front. An admin can only call this function
    /// @param _storeName is the address of the shop owner to be added
    function addStore(string _storeName) public onlyShopOwner {
        Stores memory store = Stores(msg.sender, _storeName, 0);
        StoreFront[numStores] = store;
        storeArray.push(numStores);
        numStores = numStores.add(1);
    }

    /// @notice Adds a new product to a store front
    /// @param _store is the store front which will list the product
    /// @param _name is the name of the product
    /// @param _quantity is the number of added products available
    /// @param _price is the price of the product
    function addProduct(uint _store, string _name, uint _quantity, uint _price) public onlyShopOwner {
        Products memory product = Products(_name, _quantity, _price, _store);
        ProductList[numProducts] = product;
        productArray.push(numProducts);
        numProducts = numProducts.add(1);
    }

    /// @notice Deletes a product
    /// @param _productCode is the code of the product to be deleted
    function deleteProduct(uint _productCode) public onlyShopOwner {
        delete ProductList[_productCode];
    }

    /// @notice To change price of a product
    /// @param _productCode is the code of the product to be modified
    /// @param _price is the new price
    function changePrice(uint _productCode, uint _price) public onlyShopOwner {
        ProductList[_productCode].price = _price;
    }

    /// @notice To get the amount the store owner has not withdrawed
    /// @param _store is the storefront for which to get the amount
    /// @return balance - the amount the shop owner can withdraw
    function getStoreBalance(uint _store) public onlyShopOwner view returns(uint) {
        return StoreFront[_store].balance;
    }

    /// @notice To withdraw the amount the store owner has not withdrawed
    /// @param _store is the storefront for which to withdraw from
    function withdrawFunds(uint _store) public payable onlyShopOwner {
        uint amount = StoreFront[_store].balance;
        require(amount > 0, "The store should have balance available to withdraw");
        StoreFront[_store].balance = StoreFront[_store].balance.sub(amount); //Prevents Reentrancy Attack
        msg.sender.transfer(amount);
    }

    /// @notice To get a list of all stores
    /// @return A list of all stores
    function getStoreList() public view returns(uint[]) {
        return storeArray;
    }

    /// @notice To get a list of all stores for a particular shop owner
    /// @return A list of all stores listed for msg.sender
    function getOwnerStoreList() public onlyShopOwner view returns(uint[]){
        uint count = 0;
        for(uint i = 0; i < storeArray.length; i++) {
            if(StoreFront[i].storeOwner == msg.sender ){
                count = count.add(1);
            }
        }

        uint[] memory list = new uint[](count);
        count = 0;
        for(uint j = 0; j < storeArray.length; j++) {
            if(StoreFront[j].storeOwner == msg.sender ){
                list[count] = storeArray[j];
                count = count.add(1);
            }
        }
        return list;
    }

    /// @notice To get more details about a particular store for store owner
    /// @param _store is the selected store
    /// @return The store name, store id and remaining balance
    function getStoreByIdOwner(uint _store) public view returns(string, uint, uint) {
        return (StoreFront[_store].storeName, _store, StoreFront[_store].balance);
    }

    /// @notice To get more details about a particular store 
    /// @param _store is the selected store
    /// @return The store name and store id
    function getStoreById(uint _store) public view returns(string, uint) {
        return (StoreFront[_store].storeName, _store);
    }

    /// @notice To get a list of all products
    /// @return A list of all products
    function getProducts() public view returns(uint[]) {
        return productArray;
    }

    /// @notice A list of all products by store
    /// @param _store for which products are to be retrieved
    /// @return A list of all products
    function getProductsByStore(uint _store) public view returns(uint[]){
        uint count = 0;
        for(uint i = 0; i < productArray.length; i++) {
            if(ProductList[i].store == _store){
                count = count.add(1);
            }
        }

        uint[] memory list = new uint[](count);
        count = 0;
        for(uint j = 0; j < productArray.length; j++) {
            if(ProductList[j].store == _store){
                list[count] = productArray[j];
                count = count.add(1);
            }
        }
        return list;
    }

    /// @notice More details about a product by product id
    /// @param _product id for which products are to be retrieved
    /// @return Product Name, Quantity, Price and Product Id
    function getProductById(uint _product) public view returns(string, uint, uint, uint) {
        return (ProductList[_product].name, ProductList[_product].quantity, ProductList[_product].price, _product);
    }

    /// @notice To buy a product listed
    /// @param _productCode is the id for the product to be bought
    function buyProduct(uint _productCode) public payable stopInEmergency{
        require(ProductList[_productCode].quantity > 0, "There should be products available");
        require(msg.value >= ProductList[_productCode].price, "The amount sent should be equal or more than price of product");
        StoreFront[ProductList[_productCode].store].balance = StoreFront[ProductList[_productCode].store].balance.add(msg.value);
        ProductList[_productCode].quantity = ProductList[_productCode].quantity.sub(1);
    }

    /// @notice To get the balance stored in the contract
    /// @return Balance stored in the contract
    function getContractBalance() public onlyAdmin view returns (uint) {
        return address(this).balance;
    }

    /// @notice To change circuit breaker state
    function toggleCircuitBreaker() public onlyAdmin{
        stopped = !stopped;
    }

    /// @notice To destroy the contract in case of emergencies
    function destroyContract() public onlyAdmin {
        selfdestruct(this);
    }
    
}
