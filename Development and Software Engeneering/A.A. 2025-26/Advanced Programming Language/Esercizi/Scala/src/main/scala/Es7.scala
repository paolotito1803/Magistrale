def pairs(n: Int): List[(Int, Int)] = for {
  i <- (1 to n).toList
  j<- (i+1 to n)
} yield(i, j)