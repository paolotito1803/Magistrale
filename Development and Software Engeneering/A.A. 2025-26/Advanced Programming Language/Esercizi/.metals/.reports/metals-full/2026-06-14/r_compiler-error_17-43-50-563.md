error id: 016CF4C1500EBE40ECE4D11C9E62CFA7
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Esame-2025/exam.scala
### java.lang.AssertionError: assertion failed: position error, parent span does not contain child span
parent      =  extends Export[Customer] {
  def tiCsv(t: Customer) = _root_.scala.Predef.???
} # -1,
parent span = <2373..2422>,
child       = def tiCsv(t: Customer) = _root_.scala.Predef.??? # -1,
child span  = [2400..2404..2473]

occurred in the presentation compiler.



action parameters:
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Esame-2025/exam.scala
text:
```scala
enum XmlNode:
    case XmlText(text: String)
    case XmlAttribute(key: String, value: String)
    case class XmlElement(name: String, attributes: List[XmlAttribute] = Nil, children: List[XmlNode] = Nil)

val bookRepresentation: XmlNode = 
  XmlElement(
    name = "book",
    attributes = List(XmlAttribute("id", "b101")),
    children = List(
      XmlElement(
        name = "title", 
        attributes = Nil, 
        children = List(XmlText("Programming in Scala"))
      ),
      XmlElement(
        name = "author", 
        attributes = Nil, 
        children = List(XmlText("Martin Odersky"))
      )
    )
  )

  def intToXML(i: int): XmlNode = XmlElement("int", children = List(XmlText(i.toString)))
  def stringToXML(s: String): XmlNode = XmlElement("string", children = List(XmlText(s)))
  
  def intsToXML(list: List[Int]): XmlNode = XmlElement(name = "ints", attributes = Nil, children = List(list.map(l => intToXML(l))))
  def stringsToXML(list: List[String]): XmlNode = XmlElement(name = "strings", attributes = Nil, children = List(list.map(l => stringToXML(l)))) 

  case class Country(name: String, state: String)
  case class Person(name: String, age: Int, country: Country)

  def countryToXML(c: Country): XmlNode = XmlElement(
    name = "country",
    attributes = Nil,
    children = List(
      XmlElement("name", Nil, List(XmlText(c.name))),
      XmlElement("state", Nil, List(XmlText(c.state)))
    )
)
  def personToXML(p: Person): XmlNode = XmlElement(
    name = "Person",
    attributes = Nil,
    children = List(
        XmlElement("name", Nil, List(XmlText(p.name))),
        XmlElement("age", Nil, List(XmlText(p.age.toString))),
        XmlElement(
            name = "country",
            attributes = Nil,
            children = List(
                XmlElement("name", Nil, children = List(XmlText(p.country.name))),
                XmlElement("state", Nil, children = List(XmlText(p.country.state)))
            )
        )
    ) 
  )

  def maxElem(list: List[Int]): Int = 
    reduceRight[Int]((x, y) => if x > y then x else y)(list)

case class Customer(name: String, email: String)
case class Invoice(id: Int, amount: Double)
case class Product(code: String, price: Double)

trait Export[T]:
    def toCsv(t: T): String
    def toJson(t: T): String

given Export[Customer] with
    def tiCsv(t: Customer) 
























given Export[Customer] with
    def toCsv(t: Customer): String = s"${t.name}, ${t.email}"
    def toJson(t: Customer): String = s"""{"name": "${t.name}", "email": "${t.email}"}"""

given Export[Invoice] with
    def toCsv(i: Invoice): String = s"${i.id},${i.amount}"
    def toJson(i: Invoice): String = s"""{"id": ${i.id}, "amount": ${i.amount}}"""

given Export[Product] with
    def toCsv(p: Product): String = s"${p.code},${p.price}"
    def toJson(p: Product): String = s"""{"code": "${p.code}", "price": ${p.price}}"""

def exportAll[T: Export](data: List[T], format: String): List[String] = format match {
    case "csv" => data.map(item => summon[Export[T]].toCsv(item))
    case "json" => data.map(item => summon[Export[T]].toJson(item))
}
```


presentation compiler configuration:
Scala version: 3.3.7-bin-nonbootstrapped
Classpath:
<HOME>\AppData\Local\Coursier\cache\v1\https\repo1.maven.org\maven2\org\scala-lang\scala3-library_3\3.3.7\scala3-library_3-3.3.7.jar [exists ], <HOME>\AppData\Local\Coursier\cache\v1\https\repo1.maven.org\maven2\org\scala-lang\scala-library\2.13.16\scala-library-2.13.16.jar [exists ]
Options:





#### Error stacktrace:

```
scala.runtime.Scala3RunTime$.assertFailed(Scala3RunTime.scala:8)
	dotty.tools.dotc.ast.Positioned.check$1(Positioned.scala:175)
	dotty.tools.dotc.ast.Positioned.check$1$$anonfun$3(Positioned.scala:205)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:15)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:10)
	scala.collection.immutable.List.foreach(List.scala:334)
	dotty.tools.dotc.ast.Positioned.check$1(Positioned.scala:205)
	dotty.tools.dotc.ast.Positioned.checkPos(Positioned.scala:226)
	dotty.tools.dotc.ast.Positioned.check$1(Positioned.scala:200)
	dotty.tools.dotc.ast.Positioned.checkPos(Positioned.scala:226)
	dotty.tools.dotc.ast.Positioned.check$1(Positioned.scala:200)
	dotty.tools.dotc.ast.Positioned.check$1$$anonfun$3(Positioned.scala:205)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:15)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:10)
	scala.collection.immutable.List.foreach(List.scala:334)
	dotty.tools.dotc.ast.Positioned.check$1(Positioned.scala:205)
	dotty.tools.dotc.ast.Positioned.checkPos(Positioned.scala:226)
	dotty.tools.dotc.parsing.Parser.parse$$anonfun$1(ParserPhase.scala:39)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:15)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:10)
	dotty.tools.dotc.core.Phases$Phase.monitor(Phases.scala:467)
	dotty.tools.dotc.parsing.Parser.parse(ParserPhase.scala:40)
	dotty.tools.dotc.parsing.Parser.$anonfun$2(ParserPhase.scala:52)
	scala.collection.Iterator$$anon$6.hasNext(Iterator.scala:479)
	scala.collection.Iterator$$anon$9.hasNext(Iterator.scala:583)
	scala.collection.immutable.List.prependedAll(List.scala:152)
	scala.collection.immutable.List$.from(List.scala:685)
	scala.collection.immutable.List$.from(List.scala:682)
	scala.collection.IterableOps$WithFilter.map(Iterable.scala:900)
	dotty.tools.dotc.parsing.Parser.runOn(ParserPhase.scala:51)
	dotty.tools.dotc.Run.runPhases$1$$anonfun$1(Run.scala:351)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:15)
	scala.runtime.function.JProcedure1.apply(JProcedure1.java:10)
	scala.collection.ArrayOps$.foreach$extension(ArrayOps.scala:1324)
	dotty.tools.dotc.Run.runPhases$1(Run.scala:344)
	dotty.tools.dotc.Run.compileUnits$$anonfun$1(Run.scala:384)
	dotty.tools.dotc.Run.compileUnits$$anonfun$adapted$1(Run.scala:393)
	dotty.tools.dotc.util.Stats$.maybeMonitored(Stats.scala:69)
	dotty.tools.dotc.Run.compileUnits(Run.scala:393)
	dotty.tools.dotc.Run.compileSources(Run.scala:297)
	dotty.tools.dotc.interactive.InteractiveDriver.run(InteractiveDriver.scala:161)
	dotty.tools.pc.CachingDriver.run(CachingDriver.scala:45)
	dotty.tools.pc.WithCompilationUnit.<init>(WithCompilationUnit.scala:31)
	dotty.tools.pc.SimpleCollector.<init>(PcCollector.scala:357)
	dotty.tools.pc.PcSemanticTokensProvider$Collector$.<init>(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.Collector$lzyINIT1(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.Collector(PcSemanticTokensProvider.scala:63)
	dotty.tools.pc.PcSemanticTokensProvider.provide(PcSemanticTokensProvider.scala:88)
	dotty.tools.pc.ScalaPresentationCompiler.semanticTokens$$anonfun$1(ScalaPresentationCompiler.scala:158)
	scala.meta.internal.pc.CompilerAccess.withSharedCompiler(CompilerAccess.scala:149)
	scala.meta.internal.pc.CompilerAccess.$anonfun$1(CompilerAccess.scala:93)
	scala.meta.internal.pc.CompilerAccess.onCompilerJobQueue$$anonfun$1(CompilerAccess.scala:210)
	scala.meta.internal.pc.CompilerJobQueue$Job.run(CompilerJobQueue.scala:153)
	java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
	java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
	java.base/java.lang.Thread.run(Thread.java:833)
```
#### Short summary: 

java.lang.AssertionError: assertion failed: position error, parent span does not contain child span
parent      =  extends Export[Customer] {
  def tiCsv(t: Customer) = _root_.scala.Predef.???
} # -1,
parent span = <2373..2422>,
child       = def tiCsv(t: Customer) = _root_.scala.Predef.??? # -1,
child span  = [2400..2404..2473]