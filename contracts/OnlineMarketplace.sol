pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract OnlineMarketplace is Ownable {

    using SafeMath for uint256;

    uint numStores;
    uint numProducts;

    uint[] storeArray;
    uint[] productArray;

    address fundsAddress;

    mapping (address => bool) public Admins;
    mapping (address => bool) public ShopOwner;

    constructor() public {
        Admins[msg.sender] = true;
        numStores = 0;
        numProducts = 0;
    } 

    struct Stores {
        address storeOwner;
        string storeName;
        uint balance;
    }

    struct Products {
        string name;
        uint quantity;
        uint price;
        uint store;
    }

    mapping (uint => Stores) public StoreFront;
    mapping (uint => Products) public ProductList;

    modifier onlyAdmin () { 
        require (Admins[msg.sender] == true, "Checks if sender is administrator"); 
        _;
    }

    modifier onlyShopOwner () { 
        require (ShopOwner[msg.sender] == true, "Checks if sender is Shop Owner"); 
        _;
    }

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

    function addAdmin(address _newAdmin) public onlyAdmin {
        Admins[_newAdmin] = true;
    }

    function addShopOwner(address _newShopOwner) public onlyAdmin {
        ShopOwner[_newShopOwner] = true;
    }

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

    function addStore(string _storeName) public onlyShopOwner {
        Stores memory store = Stores(msg.sender, _storeName, 0);
        StoreFront[numStores] = store;
        storeArray.push(numStores);
        numStores = numStores.add(1);
    }

    function addProduct(uint _store, string _name, uint _quantity, uint _price) public onlyShopOwner {
        Products memory product = Products(_name, _quantity, _price, _store);
        ProductList[numProducts] = product;
        productArray.push(numProducts);
        numProducts = numProducts.add(1);
    }

    function deleteProduct(uint _productCode) public onlyShopOwner {
        delete ProductList[_productCode];
    }

    function changePrice(uint _productCode, uint _price) public onlyShopOwner {
        ProductList[_productCode].price = _price;
    }

    function getStoreBalance(uint _store) public onlyShopOwner view returns(uint) {
        return StoreFront[_store].balance;
    }

    function withdrawFunds(uint _store) public payable onlyShopOwner {
        uint amount = StoreFront[_store].balance;
        msg.sender.transfer(amount);
        StoreFront[_store].balance = StoreFront[_store].balance.sub(amount);
    }

    function getStoreList() public view returns(uint[]) {
        return storeArray;
    }

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

    function getStoreByIdOwner(uint _store) public view returns(string, uint, uint) {
        return (StoreFront[_store].storeName, _store, StoreFront[_store].balance);
    }

    function getStoreById(uint _store) public view returns(string, uint) {
        return (StoreFront[_store].storeName, _store);
    }

    function getProducts() public view returns(uint[]) {
        return productArray;
    }

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

    function getProductById(uint _product) public view returns(string, uint, uint, uint) {
        return (ProductList[_product].name, ProductList[_product].quantity, ProductList[_product].price, _product);
    }

    function buyProduct(uint _productCode) public payable{
        StoreFront[ProductList[_productCode].store].balance = StoreFront[ProductList[_productCode].store].balance.add(msg.value);
        ProductList[_productCode].quantity = ProductList[_productCode].quantity.sub(1);
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
    
}
