trait Mergable[A]:
    def merge(that: A): A

case class Counter(value: Int) extends Mergable[Counter]:
    def merge(that: Counter): Counter = Counter(this.value + that.value)

case class  Log(entries: List[String]) extends Mergable[Log]:
    def merge(that: Log): LLog = {
        Log(this.entries ++ that.entries)
    }

    def  mergeAll[A <: Mergeable[A]](xs: List[A]): Option[A] = xs match {
        case Nil => None
        case _ => Some(xs.reduceLeft((acc, item) => acc.merge(item)))
    }

trait Ordered[+A]:
    def head: A
    def tail: Ordered[A]

trait  Insertable[A] extends  Ordered[A]:
     def insert(x: A): Insertable[A]

case class SortedList[A](private list: List[A]) extends Insertable[A]:
    def head: A = list.head
    def tail: SortedList[A] = SortedList(list.tail)
    def insert(x: A)(using ord: Ordering[A]): SortedList[A] = SortedList((x :: list).sorted)

case class SortedSet[A](elements: TreeSet[A])(using ord: Ordering[A]) extends Insertable[A]:
  def head: A = elements.head
  def tail: SortedSet[A] = SortedSet(elements.tail)
  
  def insert(x: A)(using ord: Ordering[A]): SortedSet[A] =
    SortedSet(elements + x)