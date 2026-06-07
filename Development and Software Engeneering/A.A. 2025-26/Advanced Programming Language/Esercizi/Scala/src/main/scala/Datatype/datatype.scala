sealed trait Transaction:
    def timestamp: Int
    def fee: Double
    def gasCost: Int
    def isValid: Boolean
    def describe: String
    def isExpensive : Boolean = fee > 100.0

case class Transfer (from : String, to : String, amount : Double, timestamp : Int) extends Transaction:
    override def fee : Double = amount * 0.01

    override def gasCost : Int = 21000

    override def isValid : Boolean = amount > 0 && from != to

    override def describe : String = s"Transfer of $amount from $from to $to at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

case class ContractDeploy (owner : String, byteCode : String, gasLimit : Int, timestamp : Int) extends Transaction:
    override def fee : Double = gasLimit * 0.0001

    override def gasCost : Int = 32000 + 200 * byteCode.length

    override def isValid : Boolean = byteCode.length > 0 && gasLimit >= gasCost

    override def describe : String = s"Contract deployment by $owner at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

case class ContractCall (caller : String, contract : String, function : String, gasLimit : Int, timestamp : Int) extends Transaction:
    override def fee : Double = gasLimit * 0.0001

    override def gasCost : Int = 5000 + 100 * function.length

    override def isValid : Boolean = function.length > 0 && gasLimit >= gasCost

    override def describe : String = s"Contract call by $caller to $contract function $function at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

case class TokenMint(owner: String, tokenName: String, supply: Int, gasLimit: Int, timestamp: Int) extends Transaction:
    override def fee: Double = gasLimit * 0.0001
    
    override def gasCost: Int = 45000
    
    override def isValid: Boolean = supply > 0 && gasLimit >= gasCost
    
    override def describe: String = s"Minting $supply tokens of $tokenName by $owner"

package ledger
sealed trait Transaction:
    def timestamp: Int
    def fee: Double
    def gasCost: Int
    def isValid: Boolean
    def describe: String

case class Transfer (from : String, to : String, amount : Double, timestamp : Int) extends Transaction:
    override def fee : Double = amount * 0.01

    override def gasCost : Int = 21000

    override def isValid : Boolean = amount > 0 && from != to

    override def describe : String = s"Transfer of $amount from $from to $to at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

case class ContractDeploy (owner : String, byteCode : String, gasLimit : Int, timestamp : Int) extends Transaction:
    override def fee : Double = gasLimit * 0.0001

    override def gasCost : Int = 32000 + 200 * byteCode.length

    override def isValid : Boolean = byteCode.length > 0 && gasLimit >= gasCost

    override def describe : String = s"Contract deployment by $owner at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

case class ContractCall (caller : String, contract : String, function : String, gasLimit : Int, timestamp : Int) extends Transaction:
    override def fee : Double = gasLimit * 0.0001

    override def gasCost : Int = 5000 + 100 * function.length

    override def isValid : Boolean = function.length > 0 && gasLimit >= gasCost

    override def describe : String = s"Contract call by $caller to $contract function $function at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

def totalFees(transactions: List[Transaction]): Double = transactions.map(_.fee).sum

def filterByAddress(addr : String, txs : List[Transaction]) : List[Transaction] = txs.filter {
    case Transfer(from, to, _, _) => from == addr || to == addr
    case ContractDeploy(owner, _, _, _) => owner == addr
    case ContractCall(caller, _, _, _, _) => caller == addr
}

def groupByKind(txs : List[Transaction]) : Map[String, List[Transaction]] = txs.groupBy {
    case _: Transfer => "Transfer"
    case _: ContractDeploy => "ContractDeploy"
    case _: ContractCall => "ContractCall"
}

class Ledger(val txs : List[Transaction]):
    def totalFees : Double = txs.map(_.fee).sum

    def filterByAddress(addr: String) : Ledger = new Ledger(txs.filter({
        case Transfer(from, to, _, _) => from == addr || to == addr
        case ContractDeploy(owner, _, _, _) => owner == addr
        case ContractCall(caller, _, _, _, _) => caller == addr
    }))

    def txInRange(lo : Int, hi : Int) : Ledger = new Ledger(txs.filter(tx => tx.timestamp >= lo && tx.timestamp <= hi))

    def groupByKind(txs: List[Transaction]) : (List[Transaction], List[Transaction], List[Transaction]) =
        txs.foldRight((List.empty[Transaction], List.empty[Transaction], List.empty[Transaction])):
        case (t: Transfer,       
        (ts, ds, cs)) => (t :: ts, ds, cs)
        case (t: ContractDeploy, (ts, ds, cs)) => (ts, t :: ds, cs)
        case (t: ContractCall,   (ts, ds, cs)) => (ts, ds, t :: cs)

    