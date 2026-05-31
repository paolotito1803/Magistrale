error id: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/subtype/subtype.scala:scala/package.List#
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/subtype/subtype.scala
empty definition using pc, found symbol in pc: scala/package.List#
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -List#
	 -scala/Predef.List#
offset: 619
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/subtype/subtype.scala
text:
```scala
import org.w3c.dom.css.Counter
trait Container[A]:
    def add(x: A): Container[A]
    def toList: List[A]
    def fromList[C](l: List[C]): Container[C]
    def size: Int = toList.size
    def isEmpty: Boolean = toList.isEmpty
    def contains(x: A): Boolean = toList.contains(x)
    def concat(other: Container[A]): Container[A] = fromList[A](toList.concat(other.toList))
    
    def map[B](f: A => B): Container[B] = fromList(toList.map(f))

class ListContainer[A] extends Container[A]:
    private val l: List[A]
    def add(x: A): Container[A] = new ListContainer[A](x :: l)
    
  def toList: List@@[A] = l
    
  def fromList[C](lista: List[C]): Container[C] = new ListContainer[C](lista)
```


#### Short summary: 

empty definition using pc, found symbol in pc: scala/package.List#