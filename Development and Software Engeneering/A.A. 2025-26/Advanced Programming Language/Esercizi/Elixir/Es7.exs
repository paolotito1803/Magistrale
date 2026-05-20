defmodule Comprehensions do
  def pairs(n) do
    # Generiamo tutte le combinazioni, ma filtriamo solo dove x è minore di y
    for x <- 1..n, y <- 1..n, x < y do
      {x, y}
    end
  end
end
