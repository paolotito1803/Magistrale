def negateAll(x : List[Int]): List[Int] = {
  x.map(_ * -1)
}

def longWords(x: List[String]): List[String] = {
    x.filter(_.length > 4)
}

def countEven(x: List[Int]): Int = {
    x.filter(_ % 2 == 0).length
}

def countEvenopt(x: List[Int]): Int = {
    x.count(_ % 2 == 0)
}