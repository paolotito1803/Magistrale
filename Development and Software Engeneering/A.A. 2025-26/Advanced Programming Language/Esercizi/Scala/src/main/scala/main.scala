@main
@main def testEsercizi(): Unit = {
  println("=== TEST ESERCIZI SCALA ===")

  // 1. doubleAdd
  // (2*2) + (3*2) = 4 + 6 = 10
  println(s"doubleAdd(2, 3): ${doubleAdd(2, 3)} -> Atteso: 10")

  // 2. countdown
  // Genera lista da 5 a 1
  println(s"countdown(5): ${countdown(5)} -> Atteso: List(5, 4, 3, 2, 1)")

  // 3. myMax
  // Trova il massimo in una lista
  println(s"myMax(List(1, 8, 3, 5)): ${myMax(List(1, 8, 3, 5))} -> Atteso: 8")

  // 4. Funzioni Lambda (Triple, addTen, isEven)
  // Triple: 5 * 3 = 15
  // addTen: 5 + 10 = 15
  // isEven: 4 % 2 == 0 = true
  println(s"Triple(5): ${Triple(5)} -> Atteso: 15")
  println(s"addTen(5): ${addTen(5)} -> Atteso: 15")
  println(s"isEven(4): ${isEven(4)} -> Atteso: true")

  // 5. Fibonacci (Normal & Fast)
  // fib(7) -> 0, 1, 1, 2, 3, 5, 8, 13
  println(s"fib(7): ${fib(7)} -> Atteso: 13")
  println(s"fastFib(7): ${fastFib(7)} -> Atteso: 13")

  // 6. classify
  // Pattern matching su tuple
  println(s"classify(0, 0): ${classify((0, 0))} -> Atteso: origin")
  println(s"classify(0, 5): ${classify((0, 5))} -> Atteso: y axis")
  println(s"classify(3, 0): ${classify((3, 0))} -> Atteso: x axis")
  println(s"classify(1, 1): ${classify((1, 1))} -> Atteso: something else")

  // 7. pairs
  // Coppie (i, j) con i < j fino a 3
  println(s"pairs(3): ${pairs(3)} -> Atteso: List((1,2), (1,3), (2,3))")

  // 8. takeWhile
  // Prendi finché i numeri sono minori di 5
  val listaTW = List(1, 2, 6, 3, 4)
  println(s"takeWhile(< 5, $listaTW): ${takeWhile(_ < 5, listaTW)} -> Atteso: List(1, 2)")

  // 9. myZipWith
  // Somma elementi di due liste a coppie
  val l1 = List(1, 2, 3)
  val l2 = List(10, 20, 30)
  println(s"myZipWith(+, $l1, $l2): ${myZipWith(_ + _, l1, l2)} -> Atteso: List(11, 22, 33)")

  // 10. challenge
  // Dispari: 1, 3, 5 -> Quadrati: 1, 9, 25 -> Somma: 35
  val listaC = List(1, 2, 3, 4, 5)
  println(s"challenge($listaC): ${challange(listaC)} -> Atteso: 35")

  println("=== TEST COMPLETATI ===")
}