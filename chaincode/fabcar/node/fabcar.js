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
      nameHash: 'E9FB6A394DB5FFD6DBA9B31AC7D9A90D56F90767AFAF1E14D6DCAA37DB180932', //Anand
      dobHash: 'E52309434E28D7E70AB5785190205D04DAD8A5177442AA5FC7DEB1297D75E23F', //'01/01/2000'
      imageHash: '16477688C0E00699C6CFA4497A3612D7E83C532062B64B250FED8908128ED548' //'blue'
    });

    users.push({
      nameHash: 'B1259567B8A27CD0EE0CE4C79D0670C75BADA9E86DCDEFF374FFD922D41CBE7E',//'Dan'
      dobHash: '2A4FBAC77EF76E8F1EFA5506ABB74761EA9B4769A8C623D473A91C594A4B021B', //'01/01/2001'
      imageHash: 'BA4788B226AA8DC2E6DC74248BB9F618CFA8C959E0C26C147BE48F6839A0B088' //'green'
    });

    users.push({
      nameHash: '19B3B12D89ED221BC4ABBB644BDAEC0296CD8D3DFD712196824AD91616FB6EF3', //'Brady'
      dobHash: 'F48706BB55A275AD54B52821BCFA0070D0B7A9A82CC3FD48F32317BFE1893439', //'01/01/2002'
      imageHash: 'B1F51A511F1DA0CD348B8F8598DB32E61CB963E5FC69E2B41485BF99590ED75A' //'red'
    });

    users.push({
      nameHash: '9DB0DA90670C42A3E9C6AC101A7D4D21404100B958EE6293C06A7821C1635309', //'Greg'
      dobHash: '22E268E872B8113027804394D77870FBEE100CDCAE918B25ADB26354712F3AE0', //'01/01/2003'
      imageHash: 'A67A41C8BC79D5DA917B5051F1F0D3F5AEB4B63BA246B3546A961EF7A3C7D931' //'pink'
    });

    for (let i = 0; i < users.length; i++) {
      users[i].docType = 'user';
      await stub.putState(users[i].nameHash, Buffer.from(JSON.stringify(users[i])));
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
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting User Name Hash ex: hash');
    }
    let userNameHash = args[0];
    let DOBHash = args[1]
    let IMGHash = args[2]

    let userAsBytes = await stub.getState(userNameHash); //get the user from chaincode state
    if (!userAsBytes || userAsBytes.toString().length <= 0) {
      throw new Error(userNameHash + ' does not exist: ');
    }
    let jsonRes = {}
    let user = JSON.parse(userAsBytes)
    if (user.dobHash === DOBHash && user.imageHash === IMGHash) {
      return Buffer.from(JSON.stringify({ "verified": true }))
    } else {
      throw new Error('DOB or Image did not match')
    }
  }

  async createUser(stub, args) {
    console.info('============= START : Create User ===========');
    if (args.length != 3) {
      throw new Error('Incorrect number of arguments. Expecting 3 - Name Hash, DoB Hash, Image Hash');
    }

    var user = {
      docType: 'user',
      nameHash: args[0],
      dobHash: args[1],
      imageHash: args[2]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(user)));
    console.info('============= END : Create User ' + user + '===========');
  }

};

shim.start(new Chaincode());
