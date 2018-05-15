# Design Patterns Used

### Circuit Breaker

I choosed this design pattern because it allowed functionalities in the contract to be stopped during emergency situations e.g when a bug is detected in the contract.
Having this design pattern would help reduce the impact of the bug until the bug has been fixed. In my contract, I have used circuit breaker in the buy product function. This is to prevent users to send value to a contract while it has an unfixed bug.

### Self Destruction

I have also placed self destruct design pattern in the contract. This is so that the contract can be deleted permanently if it has been found to be unuseable or has unfixable bugs.

### Restricting Access

To allow functions to be accessed only by certain addresses. I created modifiers to check if a user is admin or if user is shop owner. I linked these modifiers with the functions that has to be called by admin or shop owners. This would prevent the critical contract functions to be accessed by random addresses.

### Other Patterns

I only used the above patterns as I believed those three are sufficient for the contract at this stage. As more features are added, then different design patterns could be used. I found design patterns to be really useful.
