error id: 9F857C9A32D2FC48B73287128C7C71E9
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/datatype.scala
### java.lang.StringIndexOutOfBoundsException: begin 4223, end 4230, length 4224

occurred in the presentation compiler.



action parameters:
offset: 4223
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/datatype.scala
text:
```scala
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
    def totalFees : Double = txs.(_@@)
```


presentation compiler configuration:
Scala version: 3.3.7-bin-nonbootstrapped
Classpath:
<HOME>\AppData\Local\Coursier\cache\v1\https\repo1.maven.org\maven2\org\scala-lang\scala3-library_3\3.3.7\scala3-library_3-3.3.7.jar [exists ], <HOME>\AppData\Local\Coursier\cache\v1\https\repo1.maven.org\maven2\org\scala-lang\scala-library\2.13.16\scala-library-2.13.16.jar [exists ]
Options:





#### Error stacktrace:

```
java.base/java.lang.String.checkBoundsBeginEnd(String.java:4602)
	java.base/java.lang.String.substring(String.java:2705)
	dotty.tools.pc.completions.CompletionProvider.mkItem$1(CompletionProvider.scala:250)
	dotty.tools.pc.completions.CompletionProvider.completionItems(CompletionProvider.scala:356)
	dotty.tools.pc.completions.CompletionProvider.$anonfun$1(CompletionProvider.scala:149)
	scala.collection.immutable.List.map(List.scala:247)
	dotty.tools.pc.completions.CompletionProvider.completions(CompletionProvider.scala:141)
	dotty.tools.pc.ScalaPresentationCompiler.complete$$anonfun$1(ScalaPresentationCompiler.scala:197)
	scala.meta.internal.pc.CompilerAccess.withSharedCompiler(CompilerAccess.scala:149)
	scala.meta.internal.pc.CompilerAccess.$anonfun$1(CompilerAccess.scala:93)
	scala.meta.internal.pc.CompilerAccess.onCompilerJobQueue$$anonfun$1(CompilerAccess.scala:210)
	scala.meta.internal.pc.CompilerJobQueue$Job.run(CompilerJobQueue.scala:153)
	java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
	java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
	java.base/java.lang.Thread.run(Thread.java:833)
```
#### Short summary: 

java.lang.StringIndexOutOfBoundsException: begin 4223, end 4230, length 4224