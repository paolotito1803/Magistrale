import org.w3c.dom.css.Counter
trait Subtyping[A]:
    def add(x: A): Counter[A] = x => new Counter[A](x)
    def toList(l: List[])
    def fromlist