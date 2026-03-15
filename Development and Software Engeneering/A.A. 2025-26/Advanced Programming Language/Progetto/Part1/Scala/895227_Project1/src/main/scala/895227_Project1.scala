// Part 1: Functions

// Interleave
def interleave[A](xs: List[A], ys: List[A]): List[A] = (xs, ys) match {
  case (nil, b) => b
  case (a, nil) => a
  case (hx :: tx, hy :: ty) => hx :: hy :: interleave(tx, ty)
}

// chuncks
def chunks[A](n: Int, list: List[A]): List[List[A]] = {

  if (n <= 0) Nil
  else list match {
    case Nil => Nil
    case _ =>
      val firstChunk = myTake(n, list)
      val remaining = myDrop(n, list)
      firstChunk :: chunks(n, remaining)
  }
}


def myTake[A](k: Int, list: List[A]): List[A] = (k, list) match {
  case (0, _) => Nil
  case (_, Nil) => Nil
  case (n, h :: t) => h :: myTake(n - 1, t)
}


def myDrop[A](k: Int, list: List[A]): List[A] = (k, list) match {
  case (0, l) => l
  case (_, Nil) => Nil
  case (n, _ :: t) => myDrop(n - 1, t)
}