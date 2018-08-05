/*
# Copyright InstaID. All Rights Reserved.
#
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  // The Init method is called when the Smart Contract 'instaid' is instantiated by the blockchain network
  // Best practice is to have any Ledger initialization in separate function -- see initLedger()
  async Init(stub) {
    console.info('=========== Instantiated instaid chaincode ===========');
    return shim.success();
  }

  // Inserts basic data
  async initLedger(stub, args) {
    console.info('============= START : Initialize Ledger ===========');
    let users = [];
    users.push({
      nameHash: 'Anand',
      dobHash: '01/01/2000',
      imageHash: 'blue'
    });

    users.push({
      nameHash: 'Dan',
      dobHash: '01/01/2001',
      imageHash: 'green'
    });

    users.push({
      nameHash: 'Brady',
      dobHash: '01/01/2002',
      imageHash: 'red'
    });

    users.push({
      nameHash: 'Greg',
      dobHash: '01/01/2003',
      imageHash: 'pink'
    });

    for (let i = 0; i < users.length; i++) {
      users[i].docType = 'user';
      await stub.putState('USER' + i, Buffer.from(JSON.stringify(users[i])));
      console.info('Added <--> ', users[i]);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  // The Invoke method is called as a result of an application request to run the Smart Contract
  // 'instaid'. The calling application program has also specified the particular smart contract
  // function to be called, with arguments
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryUser(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting UserNumber ex: USER01');
    }
    let userNumber = args[0];

    let userAsBytes = await stub.getState(userNumber); //get the user from chaincode state
    if (!userAsBytes || userAsBytes.toString().length <= 0) {
      throw new Error(userNumber + ' does not exist: ');
    }
    console.log(userAsBytes.toString());
    return userAsBytes;
  }

  async createUser(stub, args) {
    console.info('============= START : Create User ===========');
    if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 5');
    }

    var user = {
      docType: 'user',
      nameHash: args[1],
      dobHash: args[2],
      imageHash: args[3]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(user)));
    console.info('============= END : Create User ===========');
  }

  async changeUserOwner(stub, args) {
    console.info('============= START : changeUserOwner ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let userAsBytes = await stub.getState(args[0]);
    let user = JSON.parse(userAsBytes);
    user.owner = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(user)));
    console.info('============= END : changeUserOwner ===========');
  }
};

shim.start(new Chaincode());
