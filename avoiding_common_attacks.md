# Avoiding Common Attacks

### Avoiding Reentrancy Attacks

In order to avoid reentrancy attacks, I used a simple mechanism whereby in the functions which deals with critical functions like withdrawal, the internal work is done before making external calls like `transfer of ether` from contract. 

### Avoiding Integer Overflow and Underflow

In order to avoid this, I made use of `SafeMath` from open zepplin to perform mathematical calculations in the contract.

### Restricting Access

Some contract functions can be accessed by specific addresses only. For example, only an admin can add a store owner. This protects these functions to be called by random addresses.

### Self Destruct Option

This is implemented so that if the contract is attacked, then it can be easily destroyed to minimize the impact of the attack.