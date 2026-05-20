defmodule Pipeline do
  def challenge(list), do:
    list
    |> Enum.filter(fn x -> rem(x, 2) != 0 end)
    |> Enum.map(fn x -> x * x end)
    |> Enum.sum()
end
