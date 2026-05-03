error id: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/datatype.scala:java/lang/String#length().
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/datatype.scala
empty definition using pc, found symbol in pc: java/lang/String#length().
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -function/length.
	 -function/length#
	 -function/length().
	 -scala/Predef.function.length.
	 -scala/Predef.function.length#
	 -scala/Predef.function.length().
offset: 1297
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Datatype/datatype.scala
text:
```scala
sealed trait Transaction:
    def timestamp: Int
    def fee: Double
    def gasCost: Int
    def isValid: Boolean
    def describe: String

    case class Transfer (from : String, to : String, amount : Double, timestamp : Int) extends Transaction:
        def fee : Double = amount * 0.01

        def gasCost : Int = 21000

        def isValid : Boolean = amount > 0 && from != to

        def describe : String = s"Transfer of $amount from $from to $to at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"
    
    case class ContractDeploy (owner : String, byteCode : String, gasLimit : Int, timestamp : Int) extends Transaction:
        def fee : Double = gasLimit * 0.0001

        def gasCost : Int = 32000 + 200 * byteCode.length

        def isValid : Boolean = byteCode.length > 0 && gasLimit >= gasCost

        def describe : String = s"Contract deployment by $owner at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"

    case class ContractCall (caller : String, contract : String, function : String, gasLimit : Int, timestamp : Int) extends Transaction:
        def fee : Double = gasLimit * 0.0001

        def gasCost : Int = 5000 + 100 * function.length

        def isValid : Boolean = function.l@@ength > 0 && gasLimit >= gasCost

        def describe : String = s"Contract call by $caller to $contract function $function at timestamp $timestamp with fee $fee and gas cost $gasCost. Valid: $isValid"
```


#### Short summary: 

empty definition using pc, found symbol in pc: java/lang/String#length().