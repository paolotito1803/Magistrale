def challange(n: List[Int]): Int = {
  n.filter(_ % 2!=0).map(x=>x*x).sum
}