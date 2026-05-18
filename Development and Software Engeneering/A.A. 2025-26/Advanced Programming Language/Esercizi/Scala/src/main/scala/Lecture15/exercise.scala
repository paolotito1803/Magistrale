def negateAll(x: List[Int]): List[Int] {
    x.map(- _)
}

def longWords(x: List[String]): List[String] {
    x.filter(_.length > 4)
}

def countEven(x: List[Int]): Int {
    x.count(_ % 2 == 0)
}