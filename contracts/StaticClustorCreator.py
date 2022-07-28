import smartpy as sp
ClustorOfFA12 = sp.io.import_stored_contract("ClustorOfFA12")


class StaticClustorCreator(sp.Contract):
    def __init__(self):
        self.init(
            clustorList = sp.list([],t=sp.TAddress)
        )
        
    @sp.entry_point
    def default(self):
        sp.failwith("NOT ALLOWED")
        
    @sp.entry_point
    def createClustor(self, params):
        sp.set_type(params.tokenList, sp.TMap(sp.TAddress, sp.TNat))
        sp.set_type(params.clustorName, sp.TString)
        clustor : sp.TAddress = sp.create_contract(contract = ClustorOfFA12.ClustorOfFA12(creator=sp.sender, tokens=params.tokenList, clustorName=params.clustorName))
        self.data.clustorList.push(clustor)

    @sp.add_test(name = "ClustorCreator")
    def test():
        scenario = sp.test_scenario()
        scenario.h1("Clustor_Creator")
        temp = sp.address("tz1iCq9Fv4KXWRKiWft9cdDjcDv4YkcdeNTD")

        cc = StaticClustorCreator()
        scenario += cc    

        scenario += cc.createClustor(tokenList= sp.map({sp.address("KT1L8uYmESypf5P2Ep2QqS8L4wrB4rB29nnQ") : sp.nat(1000), sp.address("KT1E84As5ycCEEEn3mn6EqoKqUtxYfhC6z3j") : sp.nat(1000)}), clustorName="jSOL-jBTC").run(sender=temp)
        
    
