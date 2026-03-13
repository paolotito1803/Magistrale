import scala.annotation.tailrec

def fib(n: Int): Int = {
  if (n == 0) 0
  else if (n == 1) 1
  else fib(n-1) + fib(n-2)
}

def fastFib(n: Int): Int = {
  @tailrec
  def go(n: Int, a: Int, b: Int): Int = {
    if (n == 0) a
    else go(n - 1, b, a + b)
  }

  go(n, 0, 1)
}