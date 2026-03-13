def myZipWith(f: (Int, Int)=> Int, xl: List[Int], yl: List[Int]): List[Int] = (xl, yl) match {
  case (headX::tailX, headY::tailY) =>
    val res = f(headX, headY)
    res:: myZipWith(f, tailX, tailY)
  case _ => Nil
}