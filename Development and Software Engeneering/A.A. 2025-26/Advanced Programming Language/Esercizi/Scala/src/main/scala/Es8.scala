def takeWhile(p: Int=> Boolean, n: List[Int]): List[Int] = n match {
  case x:: xs if p(x)=> x::takeWhile(p, xs)
case _ => Nil
}