//ex3
object SortedRun:
    opaque type SortedRun[A] = toList[A]

    def singleton[A](x: A): SortedRun[A] = List(x)

    extension [A](r: SortedRun[A])
        def toList[A] = r.reverse

        def extended(x: A) (using Ordering[A]): Option[SortedRun[A]] = 
            if ord.lteq(r.head, x) then Some(r :: x)
            else None
//ex4
def add[U >: T <: Component](item: U): Inventory[U] =
    new Inventory[U](item :: items)

//errato perchè T in negative position e non positive

//ex5
trait Mergeable[A]:
    def merge(x: A, y: A): A

given Mergeable[Int] with
    def merge(x: Int, y: Int): Int = x + y

extension [A](x: A)(using m: Mergeable[A])
    def merge (y: A): A = m.merge(x, y)

def mergeAll[A: Mergeable] (seed: A, xs: List[A]): A = xs match
    case Nil => seed
    case head :: tail => mergeAll(seed.merge(head), tail)

