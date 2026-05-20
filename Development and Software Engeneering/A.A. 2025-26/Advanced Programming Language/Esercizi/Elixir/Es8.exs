defmodule TakeWhile do
  # 1. Caso base: se la lista è vuota, ritorniamo una lista vuota
  def take_while(predicate, []), do: []

  # 2. Caso ricorsivo: se c'è almeno un elemento
  def take_while(predicate, [head | tail]) do
    if predicate.(head) do
      # Il predicato è vero: teniamo la testa e continuiamo sulla coda
      [head | take_while(predicate, tail)]
    else
      # Il predicato è FALSO (es. abbiamo incontrato un numero che non soddisfa la condizione)
      # Dobbiamo fermarci subito e ignorare il resto della lista!
      take_while(predicate, tail)
    end
  end
end
