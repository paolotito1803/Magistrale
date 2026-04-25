defmodule Exercise do

  def lift(op, f, g, x) do
    op.(f.(x), g.(x))
  end

  def lift_all(op, x, fs) do
    fn -> fs
    |> Enum.map(fn f -> f.(x) end)
    |> Enum.reduce(x, op) end
  end

  def meet_all(fs) do
    lift_all(fn a, b -> a && b end, true, fs)
  end
end
