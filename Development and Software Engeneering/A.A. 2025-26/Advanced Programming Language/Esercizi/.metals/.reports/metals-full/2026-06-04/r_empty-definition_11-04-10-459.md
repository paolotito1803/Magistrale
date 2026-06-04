error id: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/Ledger.scala:
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/Ledger.scala
empty definition using pc, found symbol in pc: 
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 279
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/Ledger.scala
text:
```scala
sealed trait Transaction:
    def timestamp: Int
    def fee: Double
    def gasCost: Int
    def isValid: Boolean
    def describe: String

case class Transfer(from: String, to: String, amount: Double, timestamp: Int) extends Transaction:

case class ContractDeploy(own@@er : String, bytecode :: String, gasLimit :: Int, timestamp :: Int) extends Transaction:

case class ContractCall() extends Transaction:
...
```


#### Short summary: 

empty definition using pc, found symbol in pc: 