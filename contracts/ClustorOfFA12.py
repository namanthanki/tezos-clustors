import smartpy as sp
FA12 = sp.io.import_script_from_url("https://smartpy.io/dev/templates/FA1.2.py")

class ClustorOfFA12(sp.Contract):
    def __init__(
        self, 
        creator : sp.TAddress, 
        tokens : sp.TMap(sp.TAddress, sp.TNat),
        clustorName : sp.TString
        ):
        self.init(
            creator = creator,
            clustorName = clustorName,
            tokens = tokens,
            clustorInited = False,
            clustorToken = sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD"),
            lockedClustors = sp.nat(0),
            lockedBalances = sp.map(l = {}, tkey = sp.TAddress, tvalue = sp.TNat),
            lockedRewards = sp.map(l = {}, tkey = sp.TAddress, tvalue = sp.TNat)
        )

    @sp.entry_point
    def default(self):
        sp.failwith("NOT ALLOWED")

    @sp.entry_point
    def initClustorToken(self):
        sp.verify(sp.sender == self.data.creator, message="Only creator can init the clustor_token")
        sp.verify(self.data.clustorInited == False, message="The clustor token has already been inited")
        token_metadata = {    
            "decimals"    : "0",              
        }
        token = sp.create_contract(
            contract = FA12.FA12(
                admin = sp.self_address, 
                config = FA12.FA12_config(), 
                token_metadata=token_metadata)
            )
        self.data.clustorInited = True
        self.data.clustorToken = token

    @sp.entry_point
    def issueToken(self, amount : sp.TNat):
        sp.verify(self.data.clustorInited == True, message="The clustor must be inited for issuing a clustor token")
        sp.verify(amount > 0, message="Please enter a valid amount of tokens")
        token_keys = self.data.tokens.keys()
        sp.for i in token_keys:
            tokens_handler = sp.contract(
                                sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))),
                                address=i,
                                entry_point="transfer",
                                ).open_some()
            sp.transfer(sp.record(
                                from_= sp.sender,
                                to_= sp.self_address,
                                value= self.data.tokens[i] * amount
                                ),
                                sp.mutez(0),
                                tokens_handler)
        clustor_token_handler = sp.contract(
                            sp.TRecord(address=sp.TAddress,value=sp.TNat),
                            address=self.data.clustorToken,
                            entry_point="mint"
                            ).open_some()
        sp.transfer(sp.record(
                            address=sp.sender,
                            value=amount
                            ),
                            sp.mutez(0),
                            clustor_token_handler)

    @sp.entry_point
    def redeemToken(self, amount : sp.TNat):
        sp.verify(self.data.clustorInited == True, message="The clustor must be inited for redeeming a clustor token")              
        sp.verify(amount > 0, message="Please enter a valid amount of tokens")
        clustor_burn_handler = sp.contract(
                            sp.TRecord(address=sp.TAddress,value=sp.TNat),
                            address=self.data.clustorToken,
                            entry_point="burn"
                            ).open_some()
        sp.transfer(sp.record(
                            address=sp.sender,
                            value=amount
                            ),
                            sp.mutez(0),
                            clustor_burn_handler)
        token_keys = self.data.tokens.keys()
        sp.for i in token_keys:
            tokens_handler = sp.contract(
                                sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))),
                                address=i,
                                entry_point="transfer",
                                ).open_some()
            sp.transfer(sp.record(
                                from_= sp.self_address,
                                to_= sp.sender,
                                value= self.data.tokens[i] * amount
                                ),
                                sp.mutez(0),
                                tokens_handler)

    @sp.entry_point
    def lockClustors(self, amount):
        sp.set_type(amount, sp.TNat)
        sp.verify(self.data.clustorInited == True, message="The clustor tokens must be initialised before locking in the function")
        sp.verify(amount > 0, message="The locking amount cannot be zero")

        clustor_handler = sp.contract(
                            sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))),
                            address=self.data.clustorToken,
                            entry_point="transfer"
                            ).open_some()
        sp.transfer(sp.record(
                            from_=sp.sender,
                            to_=sp.self_address,
                            value=amount
                            ),
                            sp.mutez(0),
                            clustor_handler)

        sp.if self.data.lockedBalances.contains(sp.sender):
            self.data.lockedBalances[sp.sender] += amount
        sp.else:
            self.data.lockedBalances[sp.sender] = amount

        sp.if ~ self.data.lockedRewards.contains(sp.sender):
            self.data.lockedRewards[sp.sender] = sp.nat(0)

        clustor_balance = sp.contract(sp.TPair(sp.TAddress, sp.TContract(sp.TNat)), self.data.clustorToken, "getBalance").open_some()
        sp.transfer((sp.self_address , sp.self_entry_point("updateLockedClustors")),sp.tez(0),clustor_balance)

    @sp.entry_point
    def unlockClustors(self, amount):
        sp.set_type(amount, sp.TNat)
        sp.verify(self.data.clustorInited == True, message="This can be only executed after the clustor tokens are inited")
        sp.verify(amount > 0, message="The unlocking amount cannot be zero")
        sp.verify(self.data.lockedBalances.contains(sp.sender), message="You don't have any tokens locked to unlock")

        clustor_handler = sp.contract(
                            sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_ as from", ("to_ as to", "value"))),
                            address=self.data.clustorToken,
                            entry_point="transfer"
                            ).open_some()
        sp.transfer(sp.record(
                            from_=sp.self_address,
                            to_=sp.sender,
                            value=amount
                            ),
                            sp.mutez(0),
                            clustor_handler)
        sp.if self.data.lockedBalances[sp.sender] - amount == 0:
            del self.data.lockedBalances[sp.sender]
            sp.if self.data.lockedRewards[sp.sender] != 0:
                sp.send(sp.sender, sp.utils.nat_to_mutez(self.data.lockedRewards[sp.sender]))
            del self.data.lockedRewards[sp.sender]
        sp.else:
            claimable = (self.data.lockedRewards[sp.sender] / self.data.lockedBalances[sp.sender]) * amount
            sp.if claimable != 0:
                sp.send(sp.sender, sp.utils.nat_to_mutez(claimable))
            self.data.lockedRewards[sp.sender] = sp.as_nat(self.data.lockedRewards[sp.sender] - claimable)
            self.data.lockedBalances[sp.sender] = sp.as_nat(self.data.lockedBalances[sp.sender] - amount)
        clustor_balance = sp.contract(sp.TPair(sp.TAddress, sp.TContract(sp.TNat)), self.data.clustorToken, "getBalance").open_some()
        sp.transfer((sp.self_address , sp.self_entry_point("updateLockedClustors")),sp.tez(0),clustor_balance)
        

    @sp.entry_point
    def updateLockedClustors(self, amt):
        sp.set_type(amt, sp.TNat)
        sp.verify(sp.sender == self.data.clustorToken, message="This can be only called by the Clustor Token contract")
        sp.verify(self.data.clustorInited == True, message="This can be only executed after the clustor tokens are inited")
        self.data.lockedClustors = amt

    @sp.entry_point
    def flashLoan(self, params):
        sp.set_type(params, sp.TRecord(amount=sp.TNat, token_address=sp.TAddress , receiver_contract=sp.TAddress))
        sp.verify(self.data.tokens.contains(params.token_address), message="There is no such token in this contract")
        sp.verify(self.data.clustorInited == True, message="This can be only executed after the clustor tokens are inited")
        sp.verify(params.amount < self.data.tokens[params.token_address] * self.data.lockedClustors, message="The contract doesn't have enough token balance")
        sp.verify(sp.amount >= sp.mutez(1000000), message="Please send a minimum amount of tez for executing the flash loan")

        c_pool = sp.contract(
            sp.TRecord(from_=sp.TAddress, to_=sp.TAddress, value=sp.TNat).layout(("from_ as from", ("to_ as to", "value"))),
            params.token_address,
            "transfer",
        ).open_some()
        sp.transfer(
            sp.record(
                from_=sp.self_address,
                to_=params.receiver_contract,
                value=params.amount,
            ),
            sp.tez(0),
            c_pool,
        )
        c_receiver = sp.contract(
            sp.TUnit,
            params.receiver_contract,
            "execute_operation",
        ).open_some()
        sp.transfer(sp.unit, sp.tez(0), c_receiver)
        sp.transfer(
            sp.record(
                from_=params.receiver_contract,
                to_=sp.self_address,
                value=params.amount,
            ),
            sp.tez(0),
            c_pool,
        )
        rewards = sp.utils.mutez_to_nat(sp.amount) / self.data.lockedClustors
        reward_keys = self.data.lockedBalances.keys()
        sp.for i in reward_keys:
            self.data.lockedRewards[i] += rewards * self.data.lockedBalances[i]

    @sp.add_test(name = "Clustor")
    def test():
        scenario = sp.test_scenario()
        scenario.h1("Clustor_Test1")

        admin = sp.test_account("Administrator")
        alice = sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD")
        bob   = sp.test_account("Bob")

        test_metadata = {    
            "decimals"    : "4",              
            "name"        : "Jakarta BTC",
            "symbol"      : "jBTC",
        }
        test_metadata2 = {    
            "decimals"    : "3",              
            "name"        : "Jakarta SOL",
            "symbol"      : "jSOL",
        }
        test_metadata3 = {    
            "decimals"    : "1",              
            "name"        : "Test",
            "symbol"      : "TEST",
        }
#        t1 = FA12.FA12(sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD"), config=FA12.FA12_config(), token_metadata = test_metadata)
#        t2 = FA12.FA12(sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD"), config=FA12.FA12_config(), token_metadata = test_metadata2) 
#        t3 = FA12.FA12(alice.address, config=FA12.FA12_config(), token_metadata = test_metadata3)

#        scenario += t1
#        scenario += t2
#        scenario += t3

#        scenario += t1.mint(sp.record(address=bob.address, value=10)).run(sender=alice)
#        scenario += t2.mint(sp.record(address=bob.address, value=10)).run(sender=alice)
#        scenario += t1.mint(sp.record(address=alice, value=10)).run(sender=alice)
#        scenario += t2.mint(sp.record(address=alice, value=10)).run(sender=alice)
#        scenario += t3.mint(sp.record(address=bob.address, value=10)).run(sender=alice.address)

        c = ClustorOfFA12(sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD"), sp.map({sp.address("KT1L8uYmESypf5P2Ep2QqS8L4wrB4rB29nnQ") : sp.nat(100), sp.address("KT1E84As5ycCEEEn3mn6EqoKqUtxYfhC6z3j") : sp.nat(100)}), clustorName="Test-1")
        scenario += c
        scenario += c.initClustorToken().run(sender=sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD"))
#        scenario.h1("Issuing the Clustor")

#        scenario += t1.approve(spender=c.address, value=sp.nat(10)).run(sender=bob.address)
#        scenario += t2.approve(spender=c.address, value=sp.nat(10)).run(sender=bob.address)
#        scenario += t3.approve(spender=c.address, value=sp.nat(10)).run(sender=bob.address)
#        scenario += t1.approve(spender=c.address, value=sp.nat(10)).run(sender=alice)
#        scenario += t2.approve(spender=c.address, value=sp.nat(10)).run(sender=alice)

#        scenario += c.issueToken(sp.nat(8)).run(sender=bob.address)
#        scenario += c.issueToken(sp.nat(4)).run(sender=alice)
#        scenario += c.redeemToken(sp.nat(2)).run(sender=bob.address)
#        scenario += c.lockClustors(sp.nat(4)).run(sender=bob.address)
#        scenario += c.lockClustors(sp.nat(2)).run(sender=alice)
#        scenario += c.unlockClustors(sp.nat(1)).run(sender=alice)
