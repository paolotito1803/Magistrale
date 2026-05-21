def myMax(n: List[Int]): Int = n match{
  case x::Nil => x
  case x::xs => Math.max(x, myMax(xs))
}

def MyMax(n : List[Int]): Int = {
  if(n.length == 1){
    n.head
  }
  else{
    Math.max(n.head, MyMax(n.tail))
  }
}

def myMax(n: List[Int]): Int = n match{
  case x::Nil => x
  case x::xs => Math.max(x, myMax(xs))
}