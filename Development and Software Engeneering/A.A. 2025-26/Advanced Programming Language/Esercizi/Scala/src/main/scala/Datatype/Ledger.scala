sealed trait Transaction:
    def timestamp: Int
    def fee: Double
    def gasCost: Int
    def isValid: Boolean
    def describe: String

case class Transfer(from: String, to: String, amount: Double, timestamp: Int) extends Transaction:
    override def fee: Double = amount * 0.01
    override def gasCost: Int = 21000
    override def isValid: Boolean = amount > 0 && from != to
    override def describe: String = s"Transfer $from -> $to $amount @\$timestamp"

case class ContractDeploy(owner: String, bytecode: String, gasLimit: Int, timestamp: Int) extends Transaction:
    override def fee: Double = gasLimit * 0.0001
    override def gasCost: Int = 32000 + 200 * bytecode.length
    override def isValid: Boolean = !bytecode.isEmpty && gasLimit >= gasCost
    override def describe: String = s"ContractDeploy $owner deploys contract ($gasLimit gas ) @\$timestamp"

case class ContractCall(caller: String, contract: String, function: String, gasLimit: Int, timestamp: Int) extends Transaction:
    override def fee: Double = gasLimit * 0.0001
    override def gasCost: Int = 50000 + 100 * function.length
    override def isValid: Boolean = !function.isEmpty && gasLimit > gasCost
    override def describe: String = s"ContractCall $caller calls $function on $contract ($gasLimit gas ) @\$timestamp"


package ledger

sealed trait Transaction:
    def timestamp: Int
    def fee: Double
    def gasCost: Int
    def isValid: Boolean
    def describe: String

case class Transfer(from: String, to: String, amount: Double, timestamp: Int) extends Transaction:
    override def fee: Double = amount * 0.01
    override def gasCost: Int = 21000
    override def isValid: Boolean = amount > 0 && from != to
    override def describe: String = s"Transfer $from -> $to $amount @\$timestamp"

case class ContractDeploy(owner: String, bytecode: String, gasLimit: Int, timestamp: Int) extends Transaction:
    override def fee: Double = gasLimit * 0.0001
    override def gasCost: Int = 32000 + 200 * bytecode.length
    override def isValid: Boolean = !bytecode.isEmpty && gasLimit >= gasCost
    override def describe: String = s"ContractDeploy $owner deploys contract ($gasLimit gas ) @\$timestamp"

case class ContractCall(caller: String, contract: String, function: String, gasLimit: Int, timestamp: Int) extends Transaction:
    override def fee: Double = gasLimit * 0.0001
    override def gasCost: Int = 50000 + 100 * function.length
    override def isValid: Boolean = !function.isEmpty && gasLimit > gasCost
    override def describe: String = s"ContractCall $caller calls $function on $contract ($gasLimit gas ) @\$timestamp"

def totalFees(txs: List[Transaction]): Double = txs.map(_.fee).sum

def filterByAddress(addr: String, txs: List[Transaction]): List[Transaction] = txs.filter {
    case Transfer(from, to, _, _) => from == addr || to == addr
    case ContractDeploy(owner, _, _, _) => owner == addr
    case ContractCall(caller, _, _, _, _) => caller == addr
}

def txInRange(lo: Int, hi: Int, txs: List[Transaction]): List[Transaction] =
    txs.filter(tx => tx.timestamp >= lo && tx.timestamp <= hi)

def groupByKind(txs: List[Transaction]) : (List[Transaction], List[Transaction], List[Transaction]) =
 txs.match{
    Nil => (Nil, Nil, Nil)
    case t: Transfer :: ts => 
        val (tr, cd, cc) = groupByKind (ts)
        (t :: tr, cd, cc)
    case t: ContractDeploy :: ts => 
        val (tr, cd, cc) = groupByKind (ts)
        (tr, t :: cd, cc)
    case t: ContractCall :: ts => 
        val (tr, cd, cc) = groupByKind (ts)
        (tr, cd, t :: cc)
 }
