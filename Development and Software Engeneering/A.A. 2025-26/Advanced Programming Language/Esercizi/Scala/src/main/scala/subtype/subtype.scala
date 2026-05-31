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

class ListContainer[A](private val l: List[A]) extends Container[A]:
    def add(x: A): Container[A] = new ListContainer[A](x :: l)
    
  def toList: List[A] = l
    
  def fromList[C](lista: List[C]): Container[C] = new ListContainer[C](lista)

  // Design 1: subtyping
trait Equatable:
def equalsTo(that: Equatable): Boolean
// Design 2: parametric
trait Equatable[A <: Equatable[A]]: // per farlo funzionare e compilare devo specificare che A deve essere comparabile e quindi lo definisco come un sottotipo di Equatable[A]
def equalsTo(that: A): Boolean
def compareTo(that: A): Int

def <(that: A): Boolean = compareTo(that) < 0
def <=(that: A): Boolean = compareTo(that) <= 0
def >=(that: A): Boolean = compareTo(that) >= 0