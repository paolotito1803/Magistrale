def fibonacci(n: Int): Int = {
    @tailrec
    def loop(k: Int, a: Int, b: Int): Int = {
       if(k == 0) a
       else loop(k - 1, b, a + b)
    }
    loop(0, 0, 1)
}