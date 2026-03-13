def myMax(n: List[Int]): Int = n match{
  case x::Nil => x
  case x::xs => Math.max(x, myMax(xs))
}