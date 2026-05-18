defmodule Exercise do

  def lift(op, g, f, x) do
    op.(f.(x), g.(x))
  end

  def adder(g, f, x) do
    lift.(&+/2, g, f, x)
  end

  def multiplier(g, f, x) do
    lift.(&*/2, g, f, x)
  end

  def divider(g, f, x) do
    lift.(&//2, g, f, x)
  end

  meet_all =
    fn predicates ->
      fn x ->
        Enum.reduce(predicates, true, fn p, acc -> acc and p.(x) end)
      end
    end
end
