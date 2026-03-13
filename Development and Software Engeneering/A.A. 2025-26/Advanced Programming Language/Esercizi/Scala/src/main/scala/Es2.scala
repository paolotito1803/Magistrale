def countdown(n: Int): List[Int] = n match {
  // Caso base: se n è minore o uguale a 0, restituisci una lista vuota
  case n if n <= 0 => Nil

  // Caso ricorsivo: aggiungi n in testa alla lista creata chiamando countdown(n-1)
  case _ => n :: countdown(n - 1)
}